import type { PaginationMeta } from '@/api/types'

export type PageWindowItem = number | 'gap'

/**
 * Los números de la paginación: con pocas páginas van todas; con muchas, la
 * primera, la última y las vecinas de la actual (`1 … 5 6 7 … 12`).
 *
 * `siblings` es cuántas vecinas por lado. Con 1 caben siete lugares, que es lo
 * que entra desde 40rem; en el celular va con 0 (cinco lugares), porque con
 * las flechas de 44px siete números no entran en 342px.
 *
 * Siempre ocupa la misma cantidad de lugares, así la fila no cambia de ancho
 * al pasar de página: cerca de un extremo, los lugares que sobran muestran más
 * páginas de ese lado (`1 2 3 4 5 … 12` y no `1 2 … 12`). Por lo mismo un "…"
 * nunca tapa una sola página: ocuparía lo mismo que el número y diría menos.
 */
export const pageWindow = (current: number, total: number, siblings = 1): PageWindowItem[] => {
    if (total <= 0) return []
    const slots = 2 * siblings + 5
    if (total <= slots) return range(1, total)

    // Los lugares de un lado cuando no hace falta "…" de ese lado.
    const edge = 2 * siblings + 3
    if (current <= siblings + 3) return [...range(1, edge), 'gap', total]
    if (current >= total - siblings - 2) return [1, 'gap', ...range(total - edge + 1, total)]
    return [1, 'gap', ...range(current - siblings, current + siblings), 'gap', total]
}

const range = (from: number, to: number): number[] =>
    Array.from({ length: to - from + 1 }, (_, index) => from + index)

/**
 * "Mostrando 13–24 de 40". Con un solo momento en la página, un solo número
 * ("Mostrando 25 de 25"): "25–25" parece un error.
 *
 * Una página sin momentos (sin resultados, o una `?pagina=` pasada del final:
 * el backend repite la página pedida con `items: []`) dice "Mostrando 0 de N".
 * Con `from >= to` salía "Mostrando 20 de 20" en una página vacía: mentía
 * justo en el caso que tiene que delatarse.
 */
export const rangeLabel = (meta: PaginationMeta): string => {
    const from = (meta.currentPage - 1) * meta.itemsPerPage + 1
    const to = Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)
    if (from > to) return `Mostrando 0 de ${meta.totalItems}`
    return from === to
        ? `Mostrando ${to} de ${meta.totalItems}`
        : `Mostrando ${from}–${to} de ${meta.totalItems}`
}
