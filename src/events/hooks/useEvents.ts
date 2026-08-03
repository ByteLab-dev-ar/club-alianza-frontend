import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getEventsAction } from '../actions/get-events.action'
import type { EventsQuery } from '../interfaces/ClubEvent'

export const useEvents = (query: EventsQuery = {}) => {
    return useQuery({
        queryKey: [QK.events, query],
        queryFn: () => getEventsAction(query),
        staleTime: 1000 * 60 * 5,
        // Al pasar de página, mantiene la lista anterior en pantalla en vez de
        // parpadear a un estado de carga vacío.
        placeholderData: keepPreviousData,
    })
}
