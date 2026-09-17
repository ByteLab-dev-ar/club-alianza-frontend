import { describe, expect, it } from 'vitest'
import { formatEventTime } from './event-time'

describe('formatEventTime', () => {
    it('agrega " hs" a la hora que carga el panel (input type="time")', () => {
        expect(formatEventTime('16:00')).toBe('16:00 hs')
        expect(formatEventTime('00:30')).toBe('00:30 hs')
        expect(formatEventTime('23:59')).toBe('23:59 hs')
    })

    it('acepta la hora sin cero adelante y con segundos', () => {
        expect(formatEventTime('9:00')).toBe('9:00 hs')
        expect(formatEventTime('19:00:00')).toBe('19:00:00 hs')
    })

    it('deja el texto libre tal cual: el caso "De 10 a 18 hs hs"', () => {
        expect(formatEventTime('De 10 a 18 hs')).toBe('De 10 a 18 hs')
        expect(formatEventTime('a las 16')).toBe('a las 16')
        expect(formatEventTime('Todo el día')).toBe('Todo el día')
        // El otro ejemplo de texto libre que nombra el backend al ordenar la agenda.
        expect(formatEventTime('A confirmar')).toBe('A confirmar')
    })

    it('no toma por hora un rango que empieza con una hora', () => {
        // El backend ordena por el HH:MM del principio, pero para mostrar es
        // texto libre: "16:00 a 18:00" no es una hora sola y no lleva sufijo.
        expect(formatEventTime('16:00 a 18:00')).toBe('16:00 a 18:00')
    })

    it('no duplica el sufijo cuando la hora ya lo trae escrito', () => {
        expect(formatEventTime('16:00 hs')).toBe('16:00 hs')
    })

    it('devuelve null cuando no hay hora cargada (el flyer ya la trae)', () => {
        expect(formatEventTime(null)).toBeNull()
        expect(formatEventTime(undefined)).toBeNull()
        expect(formatEventTime('')).toBeNull()
        expect(formatEventTime('   ')).toBeNull()
    })

    it('recorta los espacios de alrededor antes de decidir', () => {
        expect(formatEventTime('  16:00  ')).toBe('16:00 hs')
        expect(formatEventTime('  De 10 a 18 hs  ')).toBe('De 10 a 18 hs')
    })

    it('no toma por hora lo que solo se le parece', () => {
        expect(formatEventTime('24:00')).toBe('24:00')
        expect(formatEventTime('16:60')).toBe('16:60')
        expect(formatEventTime('16.00')).toBe('16.00')
        expect(formatEventTime('16')).toBe('16')
    })
})
