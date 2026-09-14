import { clubApi, unwrapPaginated } from '@/api/clubApi'
import type { PaginatedResponse } from '@/api/types'
import type { ClubEvent, EventsQuery } from '../interfaces/ClubEvent'

/**
 * GET /events — público y paginado. Ordena por fecha, después por la hora
 * normalizada y al final por `id`, ascendente salvo `order: 'desc'`. El
 * desempate es del servidor y es lo que hace que paginar no repita ni saltee
 * eventos del mismo día: no se reordena acá.
 */
export const getEventsAction = async (query: EventsQuery = {}) => {
    const response = await clubApi.get<PaginatedResponse<ClubEvent>>('/events', { params: query })
    return unwrapPaginated(response)
}
