import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type {
    CounterChargePayload,
    CounterChargeResult,
    CounterPerson,
    ReissuedReceipt,
    VerifiedReceipt,
} from '../interfaces/Counter'

/**
 * GET /admin/counter/people/{profileId} — a quiénes se les puede cobrar.
 *
 * Devuelve a la persona parada en el mostrador **y a los chicos que tiene a
 * cargo**: el mismo alcance que la app le da al tutor, así que una familia se
 * resuelve en una sola operación.
 *
 * Cada uno viene con el mismo `payable` que arma `GET /payments/cart`, así que
 * el importe se puede decir antes de recibir la plata y la cadena de §5.3 la
 * sigue resolviendo el servidor. **La morosidad no filtra acá**: al moroso le
 * llegan los precios igual, porque el mostrador es el único camino que le queda
 * para regularizar.
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
 *
 * Devuelve además el `id` del recibo, y con eso se cierra el circuito de la
 * anulación: la persona llega con el papel, lo único impreso es el código, y
 * `void` resuelve por UUID.
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
 * El `id` es el UUID del recibo y sale de `verify/{code}`: ese es el camino
 * real, porque quien pide la anulación llega con el papel en la mano y lo único
 * impreso es el código. El motivo tiene un mínimo de 10 caracteres — queda en el
 * recibo y lo lee el próximo que lo escanee.
 */
export const voidReceiptAction = async (id: string, reason: string) => {
    await clubApi.post(`/admin/counter/receipts/${id}/void`, { reason })
}

/**
 * POST /admin/counter/receipts/{id}/reissue — corregir un recibo.
 *
 * Anula el vigente y emite el reemplazo **en un solo acto**, que es lo que hace
 * imposible el estado que motivó este endpoint: un recibo anulado, sin
 * reemplazo, y sin ninguna forma de emitirlo. Por eso corregir no es "anular y
 * después cobrar de nuevo" — no hay nada que volver a cobrar.
 *
 * **No toca la plata**: el pago sigue aprobado y la cobertura acreditada. Esto
 * arregla el PAPEL. Si lo que hay que deshacer es el cobro, eso no existe en el
 * sistema y se resuelve en el mostrador.
 *
 * Devuelve el recibo nuevo con su código, para poder dibujar el QR y entregar
 * el papel sin una segunda consulta.
 */
export const reissueReceiptAction = async (id: string, reason: string) => {
    const response = await clubApi.post<ApiResponse<ReissuedReceipt>>(
        `/admin/counter/receipts/${id}/reissue`,
        { reason },
    )
    return unwrap(response)
}
