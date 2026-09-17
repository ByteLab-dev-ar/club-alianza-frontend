import { describe, expect, it } from 'vitest'

import type { PaginationMeta } from '@/api/types'
import { clampPage, isSettlingPage } from './pagination'

const meta = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
    totalItems: 30,
    itemCount: 12,
    itemsPerPage: 12,
    totalPages: 3,
    currentPage: 1,
    ...overrides,
})

describe('clampPage', () => {
    it('sin datos o con datos de relleno no corrige', () => {
        expect(clampPage(5, undefined, false)).toBeNull()
        expect(clampPage(5, meta(), true)).toBeNull()
    })

    it('una página que no existe va a la última', () => {
        expect(clampPage(5, meta({ totalPages: 3 }), false)).toBe(3)
    })

    it('borrar el único de la última página vuelve a la anterior', () => {
        // 25 momentos de a 24 eran 2 páginas; con 24 el backend repite la 2 vacía.
        const afterDelete = meta({ totalItems: 24, itemCount: 0, itemsPerPage: 24, totalPages: 1, currentPage: 2 })
        expect(clampPage(2, afterDelete, false)).toBe(1)
    })

    it('sin resultados el backend manda totalPages 0: la única página es la 1', () => {
        expect(clampPage(2, meta({ totalItems: 0, totalPages: 0 }), false)).toBe(1)
        expect(clampPage(1, meta({ totalItems: 0, totalPages: 0 }), false)).toBeNull()
    })

    it('dentro del rango no toca nada', () => {
        expect(clampPage(3, meta({ totalPages: 3 }), false)).toBeNull()
    })
})

describe('isSettlingPage', () => {
    it('una página por corregirse no puede decir que no hay nada', () => {
        expect(
            isSettlingPage({
                requested: 3,
                meta: meta({ totalPages: 2, currentPage: 3, itemCount: 0 }),
                isPlaceholderData: false,
                itemCount: 0,
            }),
        ).toBe(true)
    })

    it('el relleno vacío mientras llega la página corregida tampoco', () => {
        expect(
            isSettlingPage({
                requested: 2,
                meta: meta({ totalPages: 2, currentPage: 3, itemCount: 0 }),
                isPlaceholderData: true,
                itemCount: 0,
            }),
        ).toBe(true)
    })

    it('un relleno con elementos es la página anterior, no un vacío', () => {
        expect(
            isSettlingPage({ requested: 2, meta: meta(), isPlaceholderData: true, itemCount: 12 }),
        ).toBe(false)
    })

    it('sin resultados de verdad, en la página 1, el vacío es el final', () => {
        expect(
            isSettlingPage({
                requested: 1,
                meta: meta({ totalItems: 0, itemCount: 0, totalPages: 0 }),
                isPlaceholderData: false,
                itemCount: 0,
            }),
        ).toBe(false)
    })

    it('sin datos todavía no decide: eso es la carga inicial', () => {
        expect(
            isSettlingPage({ requested: 1, meta: undefined, isPlaceholderData: false, itemCount: undefined }),
        ).toBe(false)
    })
})
