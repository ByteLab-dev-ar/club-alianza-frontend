import type { GalleryAlbumListItem } from '../interfaces/Gallery'

/**
 * La portada "Lo más reciente" del listado.
 *
 * Es el primer momento CON FOTO de la primera página sin filtro, en el orden
 * del backend (fecha descendente, sin fecha al final, con desempate). No el
 * primero a secas: el panel crea los momentos vacíos y las fotos se suben
 * después, y un momento recién creado no puede ser tapa. Tampoco se reordena
 * nada acá.
 *
 * Límite conocido: se busca solo dentro de esos 12. Si ninguno tiene foto no
 * hay portada aunque haya un momento con fotos más atrás, y la página cae al
 * encabezado de siempre (pedido al backend: un filtro por "tiene fotos").
 */
export const pickFeatured = (items: GalleryAlbumListItem[]): GalleryAlbumListItem | null =>
    items.find((album) => album.coverUrl !== null) ?? null

/**
 * ¿La grilla es la misma lista de la que salió la portada?
 *
 * Se compara la REFERENCIA de los datos y no la página de la URL: como las
 * dos consultas leen la misma entrada de cache, en "Todas, página 1" son el
 * mismo objeto. Y también mientras llega otra categoría: el relleno de
 * `keepPreviousData` es ese mismo objeto, así que la portada sigue fuera de la
 * grilla y no aparece duplicada hasta que llega la respuesta (con el estado de
 * la URL pasaba eso, ver EventsPage). Una categoría que por casualidad trae
 * los mismos momentos que "Todas" es otro objeto y no se confunde.
 */
export const isSameListing = (listing: object | undefined, cover: object | undefined): boolean =>
    listing !== undefined && listing === cover

/**
 * Los momentos de la grilla, sin repetir la portada cuando corresponde.
 *
 * La portada NO se repite solo cuando la grilla es exactamente la lista de la
 * que salió ("Todas, página 1": `isCover`). Con un filtro la grilla va completa
 * aunque incluya a la portada, porque si no "3 momentos" mostraría dos; en la
 * página 2 no está.
 *
 * Si sacarla deja la grilla vacía (el club tiene un solo momento) no se saca:
 * si no quedaban la barra de categorías y "1 momento" arriba de un hueco.
 * Con la exclusión "Mostrando 1–12 de N" sigue siendo verdad: la página trae
 * los 12 y uno de ellos está arriba, en la portada.
 */
export const albumsForGrid = (
    items: GalleryAlbumListItem[],
    featured: GalleryAlbumListItem | null,
    { isCover }: { isCover: boolean },
): GalleryAlbumListItem[] => {
    if (!featured || !isCover) return items
    const rest = items.filter((album) => album.id !== featured.id)
    return rest.length > 0 ? rest : items
}

/**
 * "Más momentos de <categoría>": los más recientes de la misma categoría, sin
 * el que se está mirando y en el orden del backend. No son los vecinos por
 * fecha —la API no los da—, así que se piden los primeros y se descarta el
 * actual. Los momentos sin foto entran: la fila tiene su placeholder.
 */
export const pickRelated = (
    items: GalleryAlbumListItem[],
    currentId: string,
    max = 3,
): GalleryAlbumListItem[] => items.filter((album) => album.id !== currentId).slice(0, max)
