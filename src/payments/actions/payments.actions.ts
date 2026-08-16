import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { CartPerson, CreateCartPaymentPayload, NextDue, Payment } from '../interfaces/Payment'

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
