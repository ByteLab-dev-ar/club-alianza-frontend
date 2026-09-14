import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { previousDay, todayIso } from '@/lib/format'
import { getEventsAction } from '../actions/get-events.action'
import type { EventsQuery } from '../interfaces/ClubEvent'

const STALE_TIME = 1000 * 60 * 5

export const useEvents = (query: EventsQuery = {}) => {
    return useQuery({
        queryKey: [QK.events, query],
        queryFn: () => getEventsAction(query),
        staleTime: STALE_TIME,
        // Al pasar de página, mantiene la lista anterior en pantalla en vez de
        // parpadear a un estado de carga vacío.
        placeholderData: keepPreviousData,
    })
}

/**
 * Lo que la agenda deja elegir. Las fechas y el orden no: los pone cada hook,
 * y son lo que separa "lo que viene" de "ya pasaron".
 */
type AgendaQuery = Omit<EventsQuery, 'startDate' | 'endDate' | 'order'>

/**
 * Los eventos que todavía no pasaron, del más próximo en adelante.
 *
 * Existe porque `GET /events` ordena ascendente y **no filtra**: sin el
 * `startDate`, la página 1 de la agenda son los eventos más viejos que publicó
 * el club y había que paginar hasta el final para llegar a lo que viene. El
 * filtro es inclusivo, así que el evento de hoy sigue siendo "lo que viene"
 * hasta que termine el día.
 */
export const useUpcomingEvents = (query: AgendaQuery = {}) => {
    return useEvents({ ...query, startDate: todayIso() })
}

/**
 * Los eventos que ya pasaron, del más reciente al más viejo.
 *
 * Hasta ayer: lo de hoy todavía no pasó, y si entrara acá aparecería en las
 * dos secciones de la misma pantalla.
 *
 * Es un pedido común con `order: 'desc'`. Antes el endpoint solo ordenaba
 * ascendente y la vuelta se armaba de este lado —contar, pedir las últimas
 * páginas, pegarlas, recortarlas y darlas vuelta—, que además repetía o perdía
 * eventos del mismo día en el empalme porque el servidor no desempataba. Las
 * dos cosas las resuelve ahora el backend.
 */
export const usePastEvents = (query: AgendaQuery = {}) => {
    return useEvents({ ...query, endDate: previousDay(todayIso()), order: 'desc' })
}
