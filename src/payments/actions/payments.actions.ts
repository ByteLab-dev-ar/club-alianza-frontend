import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { CartPerson, CreateCartPaymentPayload, NextDue, Payment } from '../interfaces/Payment'
import type { Receipt } from '../interfaces/Receipt'

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
 * GET /payments/{paymentId}/receipt-document — el RECIBO que emitió el club.
 *
 * Ojo con los nombres, porque hay dos cosas parecidas y no son la misma:
 * `/payments/{id}/receipt` devuelve los BYTES del comprobante que subió quien
 * pagó —la foto de la transferencia—; esto devuelve el recibo del club. El
 * primero es lo que la persona entregó; el segundo, la prueba de que el club se
 * lo acreditó.
 *
 * Scopeado por dueño: el pago de otro socio responde 404, igual que uno
 * inexistente. Un pago todavía sin aprobar también — el recibo se emite al
 * aprobar.
 */
export const getReceiptDocumentAction = async (paymentId: string) => {
    const response = await clubApi.get<ApiResponse<Receipt>>(
        `/payments/${paymentId}/receipt-document`,
    )
    return unwrap(response)
}

/**
 * GET /payments/cart — a quiénes puede pagarles esta cuenta y qué se le puede
 * pagar a cada uno.
 *
 * El estado del titular no importa: un tutor con la membresía vencida, o
 * incluso moroso, le paga igual a sus chicos. Por eso esta pantalla no se
 * bloquea por `delinquentSince` como sí lo hace el alta de a uno.
 */
export const getCartAction = async () => {
    const response = await clubApi.get<ApiResponse<CartPerson[]>>('/payments/cart')
    return unwrap(response)
}

/**
 * POST /payments/cart — un comprobante que cubre a varias personas.
 *
 * Van SOLO la selección y el archivo. El mes, el precio, el descuento y el
 * total los calcula el servidor: mandar el importe desde el navegador sería
 * dejar que cada uno pague lo que quiera, y el backend directamente no lo
 * acepta. `items` viaja como JSON dentro del multipart.
 */
export const createCartPaymentAction = async (payload: CreateCartPaymentPayload) => {
    const formData = new FormData()
    formData.append('items', JSON.stringify(payload.items))
    formData.append('file', payload.file)

    if (payload.paymentDate) formData.append('paymentDate', payload.paymentDate)

    const response = await clubApi.post<ApiResponse<Payment>>('/payments/cart', formData)
    return unwrap(response)
}
