import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { CreatePaymentPayload, NextDue, Payment } from '../interfaces/Payment'

/** GET /payments/my-payments — array plano, no paginado. */
export const getMyPaymentsAction = async () => {
    const response = await clubApi.get<ApiResponse<Payment[]>>('/payments/my-payments')
    return unwrap(response)
}

/**
 * GET /payments/next-due — el período que corresponde pagar, decidido por el
 * servidor. Hay uno solo disponible por vez y no avanza hasta que se aprueba
 * el anterior: esto es lo que hace imposible saltear meses o pagar dos veces
 * el mismo.
 */
export const getNextDueAction = async () => {
    const response = await clubApi.get<ApiResponse<NextDue>>('/payments/next-due')
    return unwrap(response)
}

/**
 * POST /payments — multipart con el comprobante (imagen o PDF).
 * El pago queda en PENDING hasta que tesorería lo aprueba o rechaza.
 */
export const createPaymentAction = async (payload: CreatePaymentPayload) => {
    const formData = new FormData()
    formData.append('amount', String(payload.amount))
    formData.append('file', payload.file)

    if (payload.paymentDate) formData.append('paymentDate', payload.paymentDate)
    if (payload.monthlyDueMonth) formData.append('monthlyDueMonth', payload.monthlyDueMonth)

    const response = await clubApi.post<ApiResponse<Payment>>('/payments', formData)
    return unwrap(response)
}
