import { describe, expect, it } from 'vitest'
import { formatCalendarDate, formatMoney, formatMonth, parseCalendarDate } from './format'

describe('formatCalendarDate', () => {
    it('formatea una fecha de calendario del backend', () => {
        expect(formatCalendarDate('2026-07-14')).toBe('14/07/2026')
    })

    it('NO corre el día para atrás con timestamps UTC (Argentina es UTC-3)', () => {
        // Este es el motivo de existir del helper: la medianoche UTC del 14
        // son las 21 hs del 13 en Argentina; formatear ingenuamente mostraba
        // el día anterior. El helper recorta la parte de fecha antes de parsear.
        expect(formatCalendarDate('2026-07-14T00:00:00.000Z')).toBe('14/07/2026')
    })

    it('acepta patrones custom en español', () => {
        expect(formatCalendarDate('2026-07-14', 'MMMM yyyy')).toBe('julio 2026')
    })
})

describe('formatMonth', () => {
    it('convierte el período YYYY-MM del backend a nombre de mes en castellano', () => {
        expect(formatMonth('2026-09')).toBe('septiembre 2026')
        expect(formatMonth('2026-01')).toBe('enero 2026')
    })
})

describe('parseCalendarDate', () => {
    it('devuelve el día calendario correcto también para timestamps', () => {
        const parsed = parseCalendarDate('2026-07-14T00:00:00.000Z')
        expect(parsed.getDate()).toBe(14)
        expect(parsed.getMonth()).toBe(6)
    })
})

// El separador entre "$" y el número puede ser un NBSP (U+00A0) según la
// versión de ICU: se normaliza a espacio común antes de comparar. El escape
// va en vez del carácter literal, que el lint prohíbe con razón.
const NBSP = String.fromCharCode(0xa0)
const normalize = (money: string) => money.replaceAll(NBSP, ' ')

describe('formatMoney', () => {
    it('formatea pesos argentinos sin decimales', () => {
        expect(normalize(formatMoney(8500))).toBe('$ 8.500')
    })

    it('redondea los centavos', () => {
        expect(normalize(formatMoney(8500.4))).toBe('$ 8.500')
    })
})
