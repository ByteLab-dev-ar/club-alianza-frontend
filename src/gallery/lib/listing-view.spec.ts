import { describe, expect, it } from 'vitest'

import { listingView, type ListingViewInput } from './listing-view'

const input = (overrides: Partial<Omit<ListingViewInput, 'listing'>> & { listing?: Partial<ListingViewInput['listing']> } = {}): ListingViewInput => {
    const { listing, ...rest } = overrides
    return {
        categorySlug: null,
        categoryName: undefined,
        categoriesStatus: 'success',
        isFixingPage: false,
        gridCount: 9,
        ...rest,
        listing: {
            isPending: false,
            isError: false,
            isPlaceholderData: false,
            itemCount: 10,
            totalItems: 10,
            ...listing,
        },
    }
}

describe('listingView', () => {
    it('"Todas" con datos propios: título, total y grilla', () => {
        expect(listingView(input())).toEqual({ heading: 'Todos los momentos', count: 10, results: 'ready' })
    })

    it('una categoría resuelta lleva su nombre', () => {
        const view = listingView(input({ categorySlug: 'social', categoryName: 'Social', listing: { totalItems: 4 } }))
        expect(view).toEqual({ heading: 'Social', count: 4, results: 'ready' })
    })

    it('mientras llega otra categoría: el título nuevo, el conteo viejo NO y la grilla atenuada', () => {
        const view = listingView(
            input({ categorySlug: 'social', categoryName: 'Social', listing: { isPlaceholderData: true, totalItems: 10 } }),
        )
        expect(view).toEqual({ heading: 'Social', count: 'loading', results: 'stale' })
    })

    it('un relleno sin momentos no se lee como "no hay momentos"', () => {
        const view = listingView(
            input({ categorySlug: 'social', categoryName: 'Social', gridCount: 0, listing: { isPlaceholderData: true, itemCount: 0, totalItems: 0 } }),
        )
        expect(view.results).toBe('loading')
        expect(view.count).toBe('loading')
    })

    it('un slug que no es ninguna categoría: "Momentos", cero y vacío, sin esperar a la API', () => {
        const view = listingView(input({ categorySlug: 'natacion', gridCount: 0, listing: { isPending: true, itemCount: undefined, totalItems: undefined } }))
        expect(view).toEqual({ heading: 'Momentos', count: 0, results: 'empty-category' })
    })

    it('con las categorías cargando no se sabe el título todavía', () => {
        const view = listingView(
            input({ categorySlug: 'social', categoriesStatus: 'pending', gridCount: 0, listing: { isPending: true, itemCount: undefined, totalItems: undefined } }),
        )
        expect(view).toEqual({ heading: null, count: 'loading', results: 'loading' })
    })

    it('con las categorías caídas es un error, no un vacío', () => {
        const view = listingView(
            input({ categorySlug: 'social', categoriesStatus: 'error', gridCount: 0, listing: { isPending: true, itemCount: undefined, totalItems: undefined } }),
        )
        expect(view.results).toBe('error')
        expect(view.count).toBeNull()
    })

    it('"Todas" no depende de las categorías', () => {
        expect(listingView(input({ categoriesStatus: 'error' })).results).toBe('ready')
    })

    it('la lista caída es un error y no muestra un total', () => {
        expect(listingView(input({ listing: { isError: true } }))).toEqual({
            heading: 'Todos los momentos',
            count: null,
            results: 'error',
        })
    })

    it('sin momentos: con filtro, el vacío de la categoría; sin filtro, el del club', () => {
        const none = { itemCount: 0, totalItems: 0 }
        expect(listingView(input({ gridCount: 0, listing: none })).results).toBe('empty')
        expect(listingView(input({ categorySlug: 'social', categoryName: 'Social', gridCount: 0, listing: none })).results).toBe(
            'empty-category',
        )
    })

    it('corrigiendo una página que no existe, esqueleto y no la caja vacía', () => {
        const view = listingView(input({ isFixingPage: true, gridCount: 0, listing: { itemCount: 0, totalItems: 10 } }))
        expect(view.results).toBe('loading')
        expect(view.count).toBe(10)
    })

    it('la primera carga, esqueletos', () => {
        const view = listingView(input({ gridCount: 0, listing: { isPending: true, itemCount: undefined, totalItems: undefined } }))
        expect(view).toEqual({ heading: 'Todos los momentos', count: 'loading', results: 'loading' })
    })
})
