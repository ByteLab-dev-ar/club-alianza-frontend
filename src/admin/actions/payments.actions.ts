import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { AdminPayment, AdminPaymentsQuery } from '../interfaces/AdminPayment'

/** GET /admin/payments — array plano (NO paginado), con filtros opcionales. */
export const getAdminPaymentsAction = async (query: AdminPaymentsQuery = {}) => {
    const response = await clubApi.get<ApiResponse<AdminPayment[]>>('/admin/payments', {
        params: query,
    })
    return unwrap(response)
}

/** PATCH /admin/payments/:id/approve — aprueba y actualiza el vencimiento del socio. */
export const approvePaymentAction = async (paymentId: string) => {
    const response = await clubApi.patch<ApiResponse<AdminPayment>>(
        `/admin/payments/${paymentId}/approve`,
    )
    return unwrap(response)
}

/** PATCH /admin/payments/:id/reject — rechaza, con motivo opcional. */
export const rejectPaymentAction = async (paymentId: string, reason?: string) => {
    const response = await clubApi.patch<ApiResponse<AdminPayment>>(
        `/admin/payments/${paymentId}/reject`,
        reason ? { reason } : {},
    )
    return unwrap(response)
}
