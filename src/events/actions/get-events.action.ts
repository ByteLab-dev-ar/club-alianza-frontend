import { clubApi, unwrapPaginated } from '@/api/clubApi'
import type { PaginatedResponse } from '@/api/types'
import type { ClubEvent, EventsQuery } from '../interfaces/ClubEvent'

/** GET /events — público, paginado, ordenado por fecha ascendente. */
export const getEventsAction = async (query: EventsQuery = {}) => {
    const response = await clubApi.get<PaginatedResponse<ClubEvent>>('/events', { params: query })
    return unwrapPaginated(response)
}
