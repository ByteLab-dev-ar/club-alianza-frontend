import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { EventCategory } from '../interfaces/ClubEvent'

/** GET /events/categories — público. Cada categoría trae su color hex. */
export const getEventCategoriesAction = async () => {
    const response = await clubApi.get<ApiResponse<EventCategory[]>>('/events/categories')
    return unwrap(response)
}
