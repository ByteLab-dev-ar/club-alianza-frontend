import { formatCalendarDate, formatMonth } from '@/lib/format'
import type { ClubEvent } from '../interfaces/ClubEvent'

export interface MonthGroup {
    /** `YYYY-MM`: el valor por el que se agrupa, no el que se muestra. */
    month: string
    events: ClubEvent[]
}

/**
 * Los eventos partidos por mes, para poder poner un rótulo entre medio.
 *
 * Es lo que convierte una grilla de tarjetas en una agenda: doce pósters
 * seguidos no dicen dónde termina septiembre y empieza octubre.
 *
 * **No reordena nada.** Agrupa corridas consecutivas y por eso depende de que
 * la lista venga ordenada por fecha, que es como la manda `GET /events`. Es a
 * propósito: si un día el backend cambiara el orden, acá aparecería el mismo
 * mes dos veces —que es un síntoma visible— en vez de un orden inventado en el
 * front que tape el cambio.
 */
export const groupEventsByMonth = (events: ClubEvent[]): MonthGroup[] => {
    const groups: MonthGroup[] = []

    for (const event of events) {
        const month = event.date.slice(0, 7)
        const last = groups.at(-1)

        if (last && last.month === month) last.events.push(event)
        else groups.push({ month, events: [event] })
    }

    return groups
}

/**
 * El rótulo del mes, con el año solo cuando hace falta.
 *
 * Una agenda que cruza diciembre muestra "diciembre" y abajo "enero", y no hay
 * forma de saber que ese enero es del año que viene. Dentro del año en curso el
 * año sobra y ensucia todos los rótulos, así que aparece únicamente cuando el
 * mes cae en otro año.
 */
export const monthLabel = (month: string, today: string): string =>
    month.slice(0, 4) === today.slice(0, 4)
        ? formatCalendarDate(`${month}-01`, 'MMMM')
        : formatMonth(month)

/**
 * El día de un evento que ya pasó: "30 ago".
 *
 * Lleva el año por el mismo motivo que el rótulo del mes, y acá pesa más: la
 * lista de pasados es la única parte del sitio que baja hasta los años
 * anteriores, y un "30 ago" suelto no dice de qué agosto habla.
 */
export const pastDateLabel = (date: string, today: string): string =>
    date.slice(0, 4) === today.slice(0, 4)
        ? formatCalendarDate(date, 'd MMM')
        : formatCalendarDate(date, 'd MMM yyyy')
