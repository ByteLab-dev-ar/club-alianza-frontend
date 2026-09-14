import { describe, expect, it } from 'vitest'

import type { ClubEvent } from '../interfaces/ClubEvent'
import { groupEventsByMonth, monthLabel, pastDateLabel } from './agenda-months'

const event = (date: string): ClubEvent => ({
    id: date,
    title: `Evento del ${date}`,
    description: null,
    date,
    time: null,
    location: null,
    imageUrl: null,
    category: null,
    createdAt: `${date}T00:00:00.000Z`,
})

describe('groupEventsByMonth', () => {
    it('parte la lista en meses y conserva el orden', () => {
        const groups = groupEventsByMonth([
            event('2026-09-14'),
            event('2026-09-28'),
            event('2026-10-05'),
        ])

        expect(groups.map((g) => g.month)).toEqual(['2026-09', '2026-10'])
        expect(groups[0]?.events.map((e) => e.date)).toEqual(['2026-09-14', '2026-09-28'])
        expect(groups[1]?.events.map((e) => e.date)).toEqual(['2026-10-05'])
    })

    it('el mismo mes de otro año es otro grupo', () => {
        // La agenda cruza diciembre: septiembre 2026 y septiembre 2027 no son
        // el mismo rótulo ni el mismo tramo.
        const groups = groupEventsByMonth([event('2026-09-14'), event('2027-09-14')])

        expect(groups.map((g) => g.month)).toEqual(['2026-09', '2027-09'])
    })

    it('sin eventos no hay rótulos', () => {
        expect(groupEventsByMonth([])).toEqual([])
    })

    it('no reordena: una lista desordenada repite el mes en vez de acomodarla', () => {
        /*
         * El backend manda la agenda ordenada por fecha y esta función se apoya
         * en eso. Si alguna vez dejara de hacerlo, el síntoma tiene que ser
         * visible —el mes aparece dos veces— y no un orden inventado acá que
         * tape el cambio. Este test fija esa decisión.
         */
        const groups = groupEventsByMonth([
            event('2026-09-14'),
            event('2026-10-05'),
            event('2026-09-28'),
        ])

        expect(groups.map((g) => g.month)).toEqual(['2026-09', '2026-10', '2026-09'])
    })
})

describe('monthLabel', () => {
    it('dentro del año en curso, el año sobra', () => {
        expect(monthLabel('2026-09', '2026-09-11')).toBe('septiembre')
    })

    it('en otro año, el año aparece', () => {
        // Diciembre y enero seguidos, sin año, no dicen de qué enero hablan.
        expect(monthLabel('2027-01', '2026-12-20')).toBe('enero 2027')
    })

    it('un mes ya pasado de otro año también lo lleva', () => {
        expect(monthLabel('2025-08', '2026-09-11')).toBe('agosto 2025')
    })
})

describe('pastDateLabel', () => {
    it('dentro del año en curso, día y mes alcanzan', () => {
        expect(pastDateLabel('2026-08-30', '2026-09-11')).toBe('30 ago')
    })

    it('de años anteriores, con año', () => {
        // La lista de pasados es lo único que baja hasta el año anterior.
        expect(pastDateLabel('2025-08-30', '2026-09-11')).toBe('30 ago 2025')
    })
})
