import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type {
    CounterChargePayload,
    CounterChargeResult,
    CounterPerson,
    VerifiedReceipt,
} from '../interfaces/Counter'

/**
 * GET /admin/counter/people/{profileId} — a quiénes se les puede cobrar.
 *
 * Devuelve a la persona parada en el mostrador **y a los chicos que tiene a
 * cargo**: el mismo alcance que la app le da al tutor, así que una familia se
 * resuelve en una sola operación.
 */
export const getCounterPeopleAction = async (profileId: string) => {
    const response = await clubApi.get<ApiResponse<CounterPerson[]>>(
        `/admin/counter/people/${profileId}`,
    )
    return unwrap(response)
}

/**
 * POST /admin/counter/payments — cobrar en efectivo.
 *
 * El cobro presencial no es otro sistema: es el mismo carrito, operado por
 * tesorería. Tres cosas lo separan del pago por transferencia, y las tres salen
 * de que no hay comprobante que subir:
 *
 * - **El pago nace aprobado.** La plata está sobre el mostrador y quien la
 *   recibe es el que valida: la cobertura se acredita en el acto.
 * - **La morosidad NO lo frena.** Es al revés: el mostrador es el único camino
 *   que le queda al socio moroso, porque la app le bloquea la carga de
 *   comprobantes justamente para empujarlo a ir. Un cobro presencial que mirara
 *   la morosidad haría imposible salir de ella.
 * - **Un comprobante pendiente que se pise no bloquea: se rechaza**, con el
 *   motivo escrito. Aprobarlo después le acreditaría el mismo mes dos veces.
 */
export const chargeAtCounterAction = async (payload: CounterChargePayload) => {
    const response = await clubApi.post<ApiResponse<CounterChargeResult>>(
        '/admin/counter/payments',
        payload,
    )
    return unwrap(response)
}

/**
 * GET /admin/counter/receipts/verify/{code}.
 *
 * Exige sesión de personal y **no es público**: revela quién lo emitió, el
 * nombre, el número de socio y qué se pagó. Eso es justamente lo que lo hace
 * servir de respaldo — cualquiera puede imprimir un papel, solo el club puede
 * decir "este lo emitió tal persona tal día".
 */
export const verifyReceiptAction = async (code: string) => {
    const response = await clubApi.get<ApiResponse<VerifiedReceipt>>(
        `/admin/counter/receipts/verify/${code}`,
    )
    return unwrap(response)
}

/**
 * POST /admin/counter/receipts/{id}/void — anular, con motivo obligatorio.
 *
 * No lo borra: el papel sigue circulando y tiene que poder responder qué le
 * pasó. **Una corrección emite un recibo NUEVO, nunca se reescribe el viejo.**
 *
 * ⚠️ **Todavía no hay pantalla que pueda llamar a esto, y no es un olvido: es
 * una puerta que falta del lado del servidor.** El `id` que pide es el UUID del
 * recibo, y ninguna de las tres respuestas que devuelven un recibo lo expone —
 * `PaymentReceiptSummaryDto` (el listado de pagos) trae número, código y estado;
 * `ReceiptResponseDto` (`/receipt-document`) trae lo mismo más el detalle; y
 * `verify/{code}` tampoco lo incluye. Con el número y el código no alcanza,
 * porque el endpoint resuelve por id.
 *
 * Se deja escrita para cuando el backend exponga ese id (o acepte el código de
 * verificación en su lugar): la anulación es la mitad de §5.10 que hoy queda sin
 * poder ejercerse desde el panel.
 */
export const voidReceiptAction = async (id: string, reason: string) => {
    await clubApi.post(`/admin/counter/receipts/${id}/void`, { reason })
}
