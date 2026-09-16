import { describe, expect, it } from 'vitest'

import { pageWindow, rangeLabel } from './page-window'

describe('pageWindow', () => {
    it('sin páginas no hay números; con una, uno solo', () => {
        expect(pageWindow(1, 0)).toEqual([])
        expect(pageWindow(1, 1)).toEqual([1])
    })

    it('hasta siete páginas van todas', () => {
        expect(pageWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it('cerca del principio, el hueco a la derecha y los lugares de sobra a la izquierda', () => {
        expect(pageWindow(1, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
        expect(pageWindow(4, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
    })

    it('en el medio, huecos a los dos lados', () => {
        expect(pageWindow(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
    })

    it('cerca del final, el hueco a la izquierda', () => {
        expect(pageWindow(12, 12)).toEqual([1, 'gap', 8, 9, 10, 11, 12])
        expect(pageWindow(9, 12)).toEqual([1, 'gap', 8, 9, 10, 11, 12])
    })

    it('sin vecinas (el celular), cinco lugares', () => {
        expect(pageWindow(3, 5, 0)).toEqual([1, 2, 3, 4, 5])
        expect(pageWindow(1, 12, 0)).toEqual([1, 2, 3, 'gap', 12])
        expect(pageWindow(6, 12, 0)).toEqual([1, 'gap', 6, 'gap', 12])
        expect(pageWindow(11, 12, 0)).toEqual([1, 'gap', 10, 11, 12])
    })

    it('siempre el mismo ancho, la actual siempre a la vista y ningún "…" tapa una sola página', () => {
        for (const siblings of [0, 1]) {
            for (let current = 1; current <= 12; current++) {
                const items = pageWindow(current, 12, siblings)
                expect(items.length).toBe(2 * siblings + 5)
                expect(items).toContain(current)
                items.forEach((item, index) => {
                    if (item !== 'gap') return
                    const before = items[index - 1]
                    const after = items[index + 1]
                    expect(typeof before === 'number' && typeof after === 'number' && after - before > 2).toBe(true)
                })
            }
        }
    })
})

describe('rangeLabel', () => {
    const meta = { totalItems: 40, itemCount: 12, itemsPerPage: 12, totalPages: 4, currentPage: 2 }

    it('dice el rango de la página', () => {
        expect(rangeLabel(meta)).toBe('Mostrando 13–24 de 40')
    })

    it('la última página parcial corta en el total', () => {
        expect(rangeLabel({ ...meta, itemCount: 4, currentPage: 4 })).toBe('Mostrando 37–40 de 40')
    })

    it('con un solo momento en la página, un solo número', () => {
        expect(
            rangeLabel({ totalItems: 5, itemCount: 1, itemsPerPage: 4, totalPages: 2, currentPage: 2 }),
        ).toBe('Mostrando 5 de 5')
    })

    it('sin resultados no inventa un rango', () => {
        expect(
            rangeLabel({ totalItems: 0, itemCount: 0, itemsPerPage: 12, totalPages: 0, currentPage: 1 }),
        ).toBe('Mostrando 0 de 0')
    })

    it('una página pasada del final se delata en vez de parecer la última', () => {
        expect(
            rangeLabel({ totalItems: 20, itemCount: 0, itemsPerPage: 12, totalPages: 2, currentPage: 3 }),
        ).toBe('Mostrando 0 de 20')
    })
})
