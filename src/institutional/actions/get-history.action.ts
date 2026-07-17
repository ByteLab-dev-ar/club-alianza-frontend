import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { HistoryMilestone } from '../interfaces/Institutional'

/** GET /history — público. Array plano (no paginado), ya ordenado por año. */
export const getHistoryAction = async () => {
    const response = await clubApi.get<ApiResponse<HistoryMilestone[]>>('/history')
    return unwrap(response)
}
