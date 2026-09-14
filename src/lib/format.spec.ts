import { describe, expect, it } from 'vitest'
import {
    formatCalendarDate,
    formatDni,
    formatMoney,
    formatMonth,
    formatPaymentMonth,
    parseCalendarDate,
    previousDay,
    todayIso,
} from './format'

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

describe('todayIso', () => {
    it('es el día del reloj local, no el día UTC', () => {
        /*
         * Lo que separa a los dos es la franja de 21 a 24 en Argentina: ahí el
         * día UTC ya es el siguiente. Si esta función usara `toISOString()`, a
         * las nueve de la noche la agenda daba por pasado el evento de esa
         * misma noche.
         */
        const ahora = new Date()
        const local = [
            ahora.getFullYear(),
            String(ahora.getMonth() + 1).padStart(2, '0'),
            String(ahora.getDate()).padStart(2, '0'),
        ].join('-')

        expect(todayIso()).toBe(local)
    })
})

describe('previousDay', () => {
    it('resta un día', () => {
        expect(previousDay('2026-09-11')).toBe('2026-09-10')
    })

    it('cruza el mes y el año', () => {
        expect(previousDay('2026-09-01')).toBe('2026-08-31')
        expect(previousDay('2026-01-01')).toBe('2025-12-31')
    })

    it('acepta el timestamp completo del backend y no corre el día', () => {
        // Mismo cuidado que `formatCalendarDate`: la medianoche UTC leída en
        // Argentina es el día anterior, así que la fecha se recorta antes.
        expect(previousDay('2026-03-02T00:00:00.000Z')).toBe('2026-03-01')
    })

    it('el 1 de marzo de un año bisiesto cae en 29', () => {
        expect(previousDay('2028-03-01')).toBe('2028-02-29')
        expect(previousDay('2026-03-01')).toBe('2026-02-28')
    })
})

describe('formatMonth', () => {
    it('convierte el período YYYY-MM del backend a nombre de mes en castellano', () => {
        expect(formatMonth('2026-09')).toBe('septiembre 2026')
        expect(formatMonth('2026-01')).toBe('enero 2026')
    })
})

describe('formatPaymentMonth', () => {
    it('formatea el período de una cuota', () => {
        expect(formatPaymentMonth('2026-09')).toBe('septiembre 2026')
    })

    it('sin período muestra "Cuota": los pagos que no son de cuota no tienen mes', () => {
        expect(formatPaymentMonth(null)).toBe('Cuota')
        expect(formatPaymentMonth(undefined)).toBe('Cuota')
    })

    it('con un valor de forma inesperada lo devuelve crudo en vez de tirar', () => {
        // Sin la guarda, formatMonth tira RangeError y el error de una sola
        // celda se lleva puesta la tabla entera.
        expect(() => formatPaymentMonth('basura')).not.toThrow()
        expect(formatPaymentMonth('basura')).toBe('basura')
        expect(formatPaymentMonth('2026-9')).toBe('2026-9')
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

describe('formatDni', () => {
    it('agrupa de a tres desde la derecha', () => {
        expect(formatDni('20001096')).toBe('20.001.096')
        expect(formatDni('7654321')).toBe('7.654.321')
    })

    it('no le pone punto a un número corto', () => {
        expect(formatDni('123')).toBe('123')
    })

    it('devuelve tal cual lo que no son solo dígitos', () => {
        // El padrón viene de una importación: puede traer cualquier cosa, y
        // puntuar algo que no es un número sería inventarle un formato.
        expect(formatDni('20.001.096')).toBe('20.001.096')
        expect(formatDni('M 5.123.456')).toBe('M 5.123.456')
        expect(formatDni('')).toBe('')
    })
})
