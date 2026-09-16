import { describe, expect, it } from 'vitest'

import type { GalleryAlbumListItem } from '../interfaces/Gallery'
import { albumsForGrid, isSameListing, pickFeatured, pickRelated } from './featured'

const album = (id: string, overrides: Partial<GalleryAlbumListItem> = {}): GalleryAlbumListItem => ({
    id,
    title: `Momento ${id}`,
    description: null,
    date: '2026-09-03',
    category: null,
    coverUrl: `https://fotos/${id}.jpg`,
    imageCount: 3,
    createdAt: '2026-09-03T12:00:00.000Z',
    ...overrides,
})

const empty = (id: string) => album(id, { coverUrl: null, imageCount: 0 })

describe('pickFeatured', () => {
    it('toma el primero con foto aunque no sea el primero de la lista', () => {
        expect(pickFeatured([empty('a'), album('b'), album('c')])?.id).toBe('b')
    })

    it('sin momentos con foto no hay portada', () => {
        expect(pickFeatured([empty('a'), empty('b')])).toBeNull()
        expect(pickFeatured([])).toBeNull()
    })

    it('no reordena: manda el orden del backend', () => {
        const items = [album('viejo', { date: '2020-01-01' }), album('nuevo', { date: '2026-09-03' })]
        expect(pickFeatured(items)?.id).toBe('viejo')
    })
})

describe('isSameListing', () => {
    it('la misma entrada de cache es la lista de la portada', () => {
        const data = { items: [album('a')] }
        expect(isSameListing(data, data)).toBe(true)
    })

    it('otra respuesta con los mismos momentos no lo es', () => {
        expect(isSameListing({ items: [album('a')] }, { items: [album('a')] })).toBe(false)
    })

    it('sin datos no hay nada que comparar', () => {
        expect(isSameListing(undefined, undefined)).toBe(false)
        expect(isSameListing(undefined, { items: [] })).toBe(false)
    })
})

describe('albumsForGrid', () => {
    const items = [album('a'), album('b'), album('c')]

    it('en "Todas, página 1" la portada no se repite', () => {
        const featured = pickFeatured(items)
        expect(albumsForGrid(items, featured, { isCover: true }).map((a) => a.id)).toEqual(['b', 'c'])
    })

    it('con un filtro o en otra página la grilla va completa', () => {
        expect(albumsForGrid(items, items[0] ?? null, { isCover: false })).toBe(items)
    })

    it('sin portada la grilla va completa', () => {
        expect(albumsForGrid(items, null, { isCover: true })).toBe(items)
    })

    it('si sacarla vacía la grilla, no se saca', () => {
        const only = [album('unico')]
        expect(albumsForGrid(only, only[0] ?? null, { isCover: true })).toBe(only)
    })
})

describe('pickRelated', () => {
    it('saca el actual esté donde esté y conserva el orden', () => {
        const items = [album('a'), album('actual'), album('b'), album('c')]
        expect(pickRelated(items, 'actual').map((a) => a.id)).toEqual(['a', 'b', 'c'])
    })

    it('corta en tres', () => {
        const items = [album('a'), album('b'), album('c'), album('d')]
        expect(pickRelated(items, 'actual').map((a) => a.id)).toEqual(['a', 'b', 'c'])
    })

    it('solo el actual no deja nada', () => {
        expect(pickRelated([album('actual')], 'actual')).toEqual([])
    })

    it('los momentos sin foto entran', () => {
        expect(pickRelated([empty('a')], 'actual').map((a) => a.id)).toEqual(['a'])
    })
})
