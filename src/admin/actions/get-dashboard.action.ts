import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { DashboardSummary } from '../interfaces/DashboardSummary'

/** GET /admin/dashboard — accesible para ADMIN y ACCOUNTANT. */
export const getDashboardAction = async () => {
    const response = await clubApi.get<ApiResponse<DashboardSummary>>('/admin/dashboard')
    return unwrap(response)
}
