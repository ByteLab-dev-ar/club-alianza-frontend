import { describe, expect, it } from 'vitest'

import {
    axisTicks,
    compactAxisValue,
    compactMoney,
    donutSegments,
    niceScale,
    ringSegmentPath,
} from './chart-geometry'

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

describe('compactMoney', () => {
    it('resume el importe del centro de la dona', () => {
        expect(compactMoney(363_300)).toBe('$ 363 k')
        expect(compactMoney(3_676_000)).toBe('$ 3,7 M')
    })
})

describe('donutSegments', () => {
    it('reparte la vuelta en proporción, arrancando arriba', () => {
        const segments = donutSegments([200, 100, 100])

        expect(segments.map((s) => s.index)).toEqual([0, 1, 2])
        expect(segments[0]?.startAngle).toBeCloseTo(-Math.PI / 2)
        expect(segments[0]?.endAngle).toBeCloseTo(Math.PI / 2)
        expect(segments[2]?.endAngle).toBeCloseTo((3 * Math.PI) / 2)
    })

    it('un medio en cero no tiene tramo, pero los otros conservan su posición', () => {
        const segments = donutSegments([0, 100, 300])

        expect(segments.map((s) => s.index)).toEqual([1, 2])
    })

    it('con un solo medio, el tramo es la vuelta entera y sin aire', () => {
        // Aire en un anillo de un solo tramo es una muesca arriba de todo.
        const [only, ...rest] = donutSegments([0, 0, 500], 0.02)

        expect(rest).toEqual([])
        expect((only?.drawEndAngle ?? 0) - (only?.drawStartAngle ?? 0)).toBeCloseTo(Math.PI * 2)
    })

    it('el aire recorta las puntas, pero nunca da vuelta un tramo angosto', () => {
        /*
         * Un tramo más angosto que el aire quedaba con el final antes del
         * principio, y el arco SVG lo dibujaba como casi la vuelta entera: el
         * medio con el 0,5% de la plata pintaba la dona completa.
         */
        const [wide, narrow] = donutSegments([995, 5], 0.1)

        expect(wide?.drawStartAngle).toBeCloseTo((wide?.startAngle ?? 0) + 0.05)
        expect(narrow?.drawEndAngle).toBeGreaterThan(narrow?.drawStartAngle ?? Infinity)
    })

    it('sin plata no hay tramos', () => {
        expect(donutSegments([0, 0, 0])).toEqual([])
    })
})

describe('ringSegmentPath', () => {
    const arcs = (path: string) => path.match(/A/g)?.length ?? 0

    it('la vuelta entera va en dos medias vueltas por borde', () => {
        /*
         * Un arco SVG que empieza y termina en el mismo punto no dibuja nada.
         * Con todo cobrado en efectivo, la dona quedaba vacía justo cuando
         * tenía que estar llena.
         */
        expect(arcs(ringSegmentPath(100, 100, 90, 60, -Math.PI / 2, (3 * Math.PI) / 2))).toBe(4)
    })

    it('un tramo parcial es un arco por borde', () => {
        expect(arcs(ringSegmentPath(100, 100, 90, 60, 0, Math.PI / 2))).toBe(2)
    })
})
