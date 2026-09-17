import { describe, expect, it } from 'vitest'

import { axisTicks, compactAxisValue, niceScale } from './chart-geometry'

describe('niceScale', () => {
    it('redondea el techo hacia arriba, con cuatro renglones como mucho', () => {
        // Septiembre de la maqueta: $ 38.000 en el mes más alto.
        expect(niceScale(38_000)).toEqual({ top: 40_000, step: 10_000 })
        expect(niceScale(363_300)).toEqual({ top: 400_000, step: 100_000 })
        // Con paso 10.000 serían cinco renglones: sube al paso redondo siguiente.
        expect(niceScale(45_000)).toEqual({ top: 60_000, step: 20_000 })
    })

    it('en un eje de personas el paso nunca es fraccionario', () => {
        // Sin `integer`, 9 da paso 2,5 y el eje dice "7,5 altas".
        expect(niceScale(9)).toEqual({ top: 10, step: 2.5 })
        expect(niceScale(9, { integer: true })).toEqual({ top: 10, step: 5 })
    })

    it('sin datos no divide por cero', () => {
        expect(niceScale(0)).toEqual({ top: 1, step: 1 })
    })
})

describe('axisTicks', () => {
    it('del cero al techo, sin arrastrar error de coma flotante', () => {
        expect(axisTicks({ top: 0.3, step: 0.1 }, 0.3)).toHaveLength(4)
        expect(axisTicks({ top: 40_000, step: 10_000 }, 38_000)).toEqual([
            0, 10_000, 20_000, 30_000, 40_000,
        ])
    })

    it('un gráfico vacío tiene solo el renglón del cero', () => {
        // Un eje que dice "0, 1" sobre un mes sin cobros inventa una escala.
        expect(axisTicks(niceScale(0), 0)).toEqual([0])
    })
})

describe('compactAxisValue', () => {
    it('no redondea el paso de 2.500 a miles enteros', () => {
        expect(compactAxisValue(2_500)).toBe('2,5k')
        expect(compactAxisValue(7_500)).toBe('7,5k')
    })

    it('abrevia miles y millones, y deja los chicos enteros', () => {
        expect(compactAxisValue(40_000)).toBe('40k')
        expect(compactAxisValue(1_250_000)).toBe('1,25 M')
        expect(compactAxisValue(750)).toBe('750')
    })
})
