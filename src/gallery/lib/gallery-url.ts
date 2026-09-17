/**
 * El estado de la galería vive en la URL y no en `useState`.
 *
 * Con el filtro y la página en memoria, entrar a un momento y volver dejaba a
 * la persona otra vez en "Todas", página 1, y tenía que rehacer el camino.
 * Con `/galeria?categoria=partidos&pagina=2` la dirección es de verdad: se
 * comparte, se recarga y el atrás del navegador la restaura. Lo mismo el visor:
 * `/galeria/<id>?visor=3` abre la tercera foto en pantalla completa.
 *
 * Todo lo de acá es puro para poder probarlo sin DOM.
 */

/** Momentos por página del listado. La portada sale de esta misma página. */
export const GALLERY_PAGE_SIZE = 12

/**
 * El nombre de la categoría hecho dirección: "Inferiores" → "inferiores",
 * "Día del Niño" → "dia-del-nino".
 *
 * La API filtra por el UUID de la categoría y no tiene slug, así que se deriva
 * del nombre (que es único en la tabla) y se resuelve contra la lista de
 * categorías. Para la dirección de una categoría usar `categorySlug`, que
 * cubre los choques; esta función sola no.
 */
export const slugify = (name: string): string =>
    name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

type CategoryLike = { id: string; name: string }

/**
 * El valor de `?categoria=` de una categoría. Casi siempre el slug del nombre;
 * el UUID en los dos casos en que el slug no la identifica:
 *
 * - Dos nombres que solo difieren en tildes o signos ("Fútbol" y "Futbol")
 *   dan el mismo slug. Con el slug para las dos, la barra marcaba las dos como
 *   activas y la segunda era inalcanzable. La primera de la lista se queda el
 *   slug; la otra va por UUID.
 * - Un nombre sin letras ni números latinos ("⚽", "—") da slug vacío, y
 *   `buildGallerySearch` lo tomaba como "Todas".
 *
 * Sin la lista de categorías (todavía no llegó) no se pueden ver los choques y
 * sale el slug: en el peor caso el link lleva a la primera de las dos.
 */
export const categorySlug = (category: CategoryLike, categories: readonly CategoryLike[]): string => {
    const slug = slugify(category.name)
    if (slug === '') return category.id
    const owner = categories.find((other) => slugify(other.name) === slug)
    return owner && owner.id !== category.id ? category.id : slug
}

export const resolveCategory = <T extends CategoryLike>(slug: string, categories: readonly T[]): T | undefined =>
    categories.find((category) => categorySlug(category, categories) === slug)

/** `?pagina=` a número. Cualquier cosa que no sea un entero positivo es la 1. */
export const parsePage = (value: string | null): number => {
    const page = Number(value)
    return Number.isInteger(page) && page > 0 ? page : 1
}

export interface GallerySearch {
    /** El slug tal como vino, sin resolver. `null` = "Todas". */
    categorySlug: string | null
    page: number
}

export const parseGallerySearch = (params: URLSearchParams): GallerySearch => ({
    categorySlug: params.get('categoria')?.trim() || null,
    page: parsePage(params.get('pagina')),
})

/**
 * El `search` del listado, con `?` incluido o vacío.
 *
 * Los valores por defecto no se escriben: `/galeria` a secas tiene que seguir
 * significando "todas, página 1". Cambiar de categoría no arrastra la página:
 * quien llama la omite, porque la página 3 de Partidos no es la 3 de Social.
 */
export const buildGallerySearch = ({
    categorySlug,
    page = 1,
}: {
    categorySlug?: string | null
    page?: number
}): string => {
    const params = new URLSearchParams()
    if (categorySlug) params.set('categoria', categorySlug)
    if (page > 1) params.set('pagina', String(page))
    const search = params.toString()
    return search ? `?${search}` : ''
}

/**
 * `?visor=N` a índice de foto, o `null` si el visor no tiene que abrirse.
 *
 * Va contado desde 1, igual que el contador que se ve ("3 de 5"): quien copia
 * la dirección de la tercera foto lee `visor=3`. Fuera de rango se ignora en
 * vez de corregirse: un enlace a la foto 6 de un momento que ahora tiene 5 no
 * es la foto 5, y abrir otra foto en pantalla completa confunde más que no
 * abrir ninguna. Un momento sin fotos nunca abre el visor.
 */
export const parseViewerParam = (value: string | null, total: number): number | null => {
    if (value === null) return null
    const position = Number(value)
    if (!Number.isInteger(position) || position < 1 || position > total) return null
    return position - 1
}

export const viewerParamValue = (index: number): string => String(index + 1)

const readState = (state: unknown): Record<string, unknown> =>
    typeof state === 'object' && state !== null ? (state as Record<string, unknown>) : {}

/**
 * El `state` con el que se abre el visor con un click: el que había (ahí viaja
 * `from`, la vuelta al filtro del listado) más la marca de que esa entrada del
 * historial la puso la app.
 */
export const viewerOpenState = (state: unknown): Record<string, unknown> => ({
    ...readState(state),
    viewerPushed: true,
})

/**
 * Cómo se cierra el visor desde la X o con Esc.
 *
 * - `back` si la entrada del historial la agregó la app al abrir: así el atrás
 *   del navegador y la X dejan el historial igual, y el adelante no reabre un
 *   visor que ya se cerró.
 * - `replace` si se entró por un enlace con `?visor=` (o sin marca): un
 *   `navigate(-1)` ahí sacaría a la persona del sitio.
 *
 * Solo `true` de verdad cuenta: un state viejo o de otra app no decide sacar a
 * nadie de la página.
 */
export const viewerCloseMode = (state: unknown): 'back' | 'replace' =>
    readState(state).viewerPushed === true ? 'back' : 'replace'

/**
 * A dónde lleva "← Galería" desde un momento.
 *
 * La tarjeta pasa el `search` del listado en `location.state.from`, así que
 * volver conserva el filtro y la página. Si se entró por un enlace compartido
 * no hay state y se vuelve a `/galeria` a secas. Se re-normaliza pasando por
 * parse y build para que un state viejo o con basura no viaje de vuelta.
 */
export const gallerySearchFromState = (state: unknown): string => {
    if (typeof state !== 'object' || state === null || !('from' in state)) return ''
    const { from } = state
    if (typeof from !== 'string' || !from.startsWith('?')) return ''
    return buildGallerySearch(parseGallerySearch(new URLSearchParams(from)))
}

export const backToGalleryHref = (state: unknown): string => `/galeria${gallerySearchFromState(state)}`
