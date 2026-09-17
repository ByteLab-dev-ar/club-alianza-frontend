import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type {
    DebtStats,
    IncomeStats,
    MembershipFlowStats,
    RosterByCategoryStats,
} from '../interfaces/AdminStats'

/*
 * Las tarjetas con gráfico del Resumen: ADMIN y ACCOUNTANT, igual que
 * `GET /admin/dashboard`. Un endpoint por tarjeta a propósito, para que un
 * gráfico caído no se lleve puesto el resumen entero.
 */

/** GET /admin/stats/income — `months` de 1 a 24 (el servidor responde 400 fuera de ahí). */
export const getIncomeStatsAction = async (months: number) => {
    const response = await clubApi.get<ApiResponse<IncomeStats>>('/admin/stats/income', {
        params: { months },
    })
    return unwrap(response)
}

/** GET /admin/stats/debt */
export const getDebtStatsAction = async () => {
    const response = await clubApi.get<ApiResponse<DebtStats>>('/admin/stats/debt')
    return unwrap(response)
}

/** GET /admin/stats/roster-by-category */
export const getRosterByCategoryStatsAction = async () => {
    const response = await clubApi.get<ApiResponse<RosterByCategoryStats>>(
        '/admin/stats/roster-by-category',
    )
    return unwrap(response)
}

/** GET /admin/stats/membership-flow */
export const getMembershipFlowStatsAction = async (months: number) => {
    const response = await clubApi.get<ApiResponse<MembershipFlowStats>>(
        '/admin/stats/membership-flow',
        { params: { months } },
    )
    return unwrap(response)
}
