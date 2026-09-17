import type { PaginationMeta } from '@/api/types'

/**
 * La página pedida, contra lo que el backend dice que existe. Una sola regla
 * para todos los listados paginados: la galería pública (que la lleva en
 * `?pagina=`) y las pantallas del panel (en estado local o en la URL).
 *
 * El backend no corrige la página: calcula `totalPages` como
 * `Math.ceil(totalItems / limit)` —0 cuando no hay nada— y repite en
 * `currentPage` la pedida aunque ya no exista, con `items: []`. Y `<Pagination>`
 * se esconde con una sola página. Sin corregir de este lado quedaba una caja
 * que decía "Todavía no hay…" y ningún botón para volver.
 */

/**
 * A qué página corregir una que ya no existe, o `null` si no hay que tocar nada.
 *
 * Pasa de verdad: alguien guarda la página 3 de la galería y el club borra
 * momentos; en el panel se borra el único momento de la última página, o
 * tesorería aprueba la última transferencia de la página 2 de "Pendientes" y la
 * fila se va de la solapa. Con 0 resultados `totalPages` viene en 0, y ahí la
 * única página que existe es la 1.
 *
 * Solo con datos propios y no con los de relleno (`keepPreviousData`): el
 * total de relleno es el de la página o el filtro anterior, y con ese total
 * la cuenta mandaría a una página que no es (misma lección que EventsPage).
 */
export const clampPage = (
    requested: number,
    meta: PaginationMeta | undefined,
    isPlaceholderData: boolean,
): number | null => {
    if (!meta || isPlaceholderData) return null
    const last = Math.max(1, meta.totalPages)
    return requested > last ? last : null
}

/**
 * Si la lista vacía que hay en pantalla todavía no es la respuesta final, y
 * por lo tanto no puede decir "Todavía no hay…".
 *
 * Son dos momentos:
 *
 * - La página está por corregirse (`clampPage`): la respuesta vacía es de una
 *   página que ya no existe, y hay elementos en las anteriores.
 * - Llegó la corrección pero la página nueva no estaba en cache: mientras
 *   carga, `keepPreviousData` rellena con la respuesta vacía de antes. Sin
 *   esto el vacío se veía un instante justo cuando no correspondía. Lo mismo
 *   al cambiar de filtro viniendo de uno sin resultados: el vacío del filtro
 *   anterior se leía como el del nuevo.
 *
 * Un relleno CON elementos no cuenta: esa es la página anterior mientras llega
 * la siguiente, y ya se muestra con la paginación deshabilitada.
 */
export const isSettlingPage = ({
    requested,
    meta,
    isPlaceholderData,
    itemCount,
}: {
    requested: number
    meta: PaginationMeta | undefined
    isPlaceholderData: boolean
    itemCount: number | undefined
}): boolean =>
    clampPage(requested, meta, isPlaceholderData) !== null || (isPlaceholderData && itemCount === 0)
