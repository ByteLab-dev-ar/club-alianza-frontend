/**
 * Qué muestra el catálogo del listado en cada momento de la carga: el título,
 * el conteo y el bloque de resultados. Sin DOM, para probar los bordes (una
 * categoría que no existe, las categorías caídas, el relleno de
 * `keepPreviousData`, una página que se está corrigiendo).
 */

export interface ListingViewInput {
    /** `?categoria=` tal como vino; `null` es "Todas". */
    categorySlug: string | null
    /** El nombre de la categoría ya resuelta contra la lista, si se resolvió. */
    categoryName: string | undefined
    categoriesStatus: 'pending' | 'error' | 'success'
    listing: {
        isPending: boolean
        isError: boolean
        isPlaceholderData: boolean
        /** Momentos de la respuesta (o del relleno), antes de sacar la portada. */
        itemCount: number | undefined
        totalItems: number | undefined
    }
    /** Hay una `?pagina=` inexistente corrigiéndose (ver `clampPage`). */
    isFixingPage: boolean
    /** Tarjetas que quedan para la grilla, ya sin la portada. */
    gridCount: number
}

/**
 * - `stale`: la grilla de la categoría o la página ANTERIOR, mientras llega la
 *   nueva. Se muestra atenuada: sin señal visible, el título ya decía "Social"
 *   con las tarjetas de Partidos abajo, y en datos móviles eso dura segundos.
 */
export type ListingResults = 'error' | 'empty-category' | 'empty' | 'loading' | 'stale' | 'ready'

export interface ListingView {
    /** `null` mientras no se sabe qué categoría es (va un esqueleto). */
    heading: string | null
    /** `'loading'` pinta un esqueleto; `null`, nada. */
    count: number | 'loading' | null
    results: ListingResults
}

export const listingView = ({
    categorySlug,
    categoryName,
    categoriesStatus,
    listing,
    isFixingPage,
    gridCount,
}: ListingViewInput): ListingView => {
    const hasSlug = categorySlug !== null

    // Un slug que no es ninguna categoría no se le pregunta a la API: "Momentos",
    // cero resultados y la salida a "Todos". Con las categorías caídas no se
    // puede saber, y eso es un error, no un vacío.
    const isUnknownCategory = hasSlug && categoriesStatus === 'success' && categoryName === undefined
    const isResolvingCategory = hasSlug && categoriesStatus === 'pending'
    const categoryFailed = hasSlug && categoriesStatus === 'error'

    const heading = !hasSlug ? 'Todos los momentos' : (categoryName ?? (isUnknownCategory ? 'Momentos' : null))

    // Relleno sin momentos (se venía de una página vacía, o de corregir una que
    // no existía) no dice nada todavía: sin esto se veía un instante "No hay
    // momentos en esta categoría" antes de que llegara la lista.
    const isPlaceholderEmpty = listing.isPlaceholderData && listing.itemCount === 0
    const isLoading = isResolvingCategory || listing.isPending || isFixingPage || isPlaceholderEmpty

    const results: ListingResults =
        categoryFailed || listing.isError
            ? 'error'
            : isUnknownCategory
              ? 'empty-category'
              : !isLoading && gridCount === 0
                ? hasSlug
                    ? 'empty-category'
                    : 'empty'
                : isLoading
                  ? 'loading'
                  : listing.isPlaceholderData
                    ? 'stale'
                    : 'ready'

    // El total del relleno es el de la categoría anterior: "Social · 10
    // momentos" con Social teniendo 4. Mientras tanto, esqueleto.
    const count: ListingView['count'] =
        results === 'error'
            ? null
            : isUnknownCategory
              ? 0
              : listing.isPlaceholderData || listing.totalItems === undefined
                ? isLoading || listing.isPlaceholderData
                    ? 'loading'
                    : null
                : listing.totalItems

    return { heading, count, results }
}
