import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { Board } from '../interfaces/Institutional'

/** GET /board — público. Devuelve el período vigente + los miembros ordenados. */
export const getBoardAction = async () => {
    const response = await clubApi.get<ApiResponse<Board>>('/board')
    return unwrap(response)
}
