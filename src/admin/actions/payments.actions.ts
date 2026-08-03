import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse } from '@/api/types'
import type { AdminPayment, AdminPaymentsQuery } from '../interfaces/AdminPayment'

/**
 * GET /admin/payments — paginado, ordenado por fecha de carga descendente.
 * Los filtros conviven con la paginación: `meta.totalItems` cuenta el resultado
 * ya filtrado.
 */
export const getAdminPaymentsAction = async (query: AdminPaymentsQuery = {}) => {
    const response = await clubApi.get<PaginatedResponse<AdminPayment>>('/admin/payments', {
        params: query,
    })
    return unwrapPaginated(response)
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
