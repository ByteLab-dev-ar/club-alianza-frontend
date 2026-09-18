import { describe, expect, it } from 'vitest'

import { axisTicks, compactAxisValue, niceScale, splitBar } from './chart-geometry'

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

describe('splitBar', () => {
    const options = { gap: 2, min: 3 }

    it('reparte el ancho en proporción, con el aire entre los dos tramos', () => {
        // 100 socios, 75 vigentes, en una barra de 402 px: quedan 400 para repartir.
        expect(splitBar(75, 25, 402, options)).toEqual({ firstWidth: 300, secondX: 302, secondWidth: 100 })
    })

    it('los dos tramos y el aire suman la barra entera', () => {
        for (const [first, second] of [[262, 188], [1, 449], [449, 1], [7, 3]] as const) {
            const bar = splitBar(first, second, 460, options)
            expect(bar.secondX + bar.secondWidth).toBeCloseTo(460)
            expect(bar.secondX - bar.firstWidth).toBe(2)
        }
    })

    it('un tramo que no es cero no desaparece, aunque la proporción dé menos de un píxel', () => {
        // 1 vencida en 450 son 0,9 px: sin el piso, la barra diría "todos vigentes".
        expect(splitBar(449, 1, 460, options).secondWidth).toBe(3)
        expect(splitBar(1, 449, 460, options).firstWidth).toBe(3)
    })

    it('con un lado en cero el otro ocupa toda la barra, sin aire', () => {
        expect(splitBar(450, 0, 460, options)).toEqual({ firstWidth: 460, secondX: 460, secondWidth: 0 })
        expect(splitBar(0, 450, 460, options)).toEqual({ firstWidth: 0, secondX: 0, secondWidth: 460 })
    })

    it('sin nada que repartir no divide por cero', () => {
        expect(splitBar(0, 0, 460, options)).toEqual({ firstWidth: 0, secondX: 0, secondWidth: 0 })
    })
})
