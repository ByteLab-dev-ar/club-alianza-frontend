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

/**
 * PATCH /admin/payments/:id/revert — **solo ADMIN**.
 *
 * "La operación no debió existir y la plata volvió": cubre la devolución que
 * decide el club y el contracargo que decide el proveedor. En una transacción da
 * de baja la cuota de cada línea, **recalcula** la cobertura y anula el recibo
 * vigente con el motivo, sin emitir uno nuevo.
 *
 * No confundirla con las dos que se le parecen:
 *
 * - **Rechazar** es no acreditar, y solo aplica a un pago PENDIENTE. Si el pago
 *   está pendiente, esta ruta responde 400 diciendo que lo que corresponde es
 *   rechazarlo.
 * - **Corregir el recibo** es que el papel decía algo que no correspondía; ahí la
 *   plata está bien y el pago se queda aprobado.
 *
 * El motivo es obligatorio y de 10 caracteres mínimo —a diferencia del rechazo—
 * porque esto deshace cobertura y anula un recibo que puede estar circulando
 * impreso: "error" no lo explica.
 */
export const revertPaymentAction = async (paymentId: string, reason: string) => {
    const response = await clubApi.patch<ApiResponse<AdminPayment>>(
        `/admin/payments/${paymentId}/revert`,
        { reason },
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
