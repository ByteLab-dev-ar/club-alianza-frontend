import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse } from '@/api/types'
import type { AdminPayment, AdminPaymentsQuery, ApprovedPayment } from '../interfaces/AdminPayment'

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

/**
 * PATCH /admin/payments/:id/approve.
 *
 * Aprobar NO siempre extiende el vencimiento: eso lo dice `coverageOutcome` en
 * la respuesta. Solo un pago de tipo MEMBERSHIP y con período crea la cuota
 * (`not_a_membership_payment` en cualquier otro caso); y aun así, si el socio ya
 * estaba cubierto hasta ese mes, la fecha no se mueve (`already_covered`).
 */
export const approvePaymentAction = async (paymentId: string) => {
    const response = await clubApi.patch<ApiResponse<ApprovedPayment>>(
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
