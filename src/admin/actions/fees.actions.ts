import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { PaymentConcept } from '@/payments/interfaces/Payment'
import type { CreateFeePayload, CurrentFees, Fee } from '../interfaces/Fee'

/** GET /admin/fees — historial y futuro, de la más nueva a la más vieja. */
export const getFeesAction = async (concept?: PaymentConcept) => {
    const response = await clubApi.get<ApiResponse<Fee[]>>('/admin/fees', {
        params: concept ? { concept } : undefined,
    })
    return unwrap(response)
}

/** GET /admin/fees/current — los tres montos que rigen hoy. */
export const getCurrentFeesAction = async () => {
    const response = await clubApi.get<ApiResponse<CurrentFees>>('/admin/fees/current')
    return unwrap(response)
}

/**
 * POST /admin/fees — cargar un monto.
 *
 * Rige desde el mes siguiente y nunca toca el mes en curso. La única excepción
 * es el PRIMER monto de un concepto, que puede empezar a regir este mes: la
 * regla protege de cambiar un precio que ya se está cobrando, y ahí no hay
 * ninguno — sin eso, un club que arranca a mitad de mes no podría cobrar hasta
 * el siguiente.
 *
 * El 409 distingue tres cosas y las tres se muestran tal cual: el mes ya pasó,
 * está en curso con un precio rigiendo, o ya hay un monto cargado para ese
 * concepto y ese mes (en cuyo caso se edita, no se carga otro).
 */
export const createFeeAction = async (payload: CreateFeePayload) => {
    const response = await clubApi.post<ApiResponse<Fee>>('/admin/fees', payload)
    return unwrap(response)
}

/**
 * PATCH /admin/fees/{id} — corregir un monto que TODAVÍA no rige.
 *
 * Solo el importe. El concepto y el mes no se editan: mover un precio de lugar
 * es borrar uno y crear otro.
 */
export const updateFeeAction = async (id: string, amount: number) => {
    const response = await clubApi.patch<ApiResponse<Fee>>(`/admin/fees/${id}`, { amount })
    return unwrap(response)
}

/** DELETE /admin/fees/{id} — se arrepintieron antes de que empezara a cobrarse. */
export const deleteFeeAction = async (id: string) => {
    await clubApi.delete(`/admin/fees/${id}`)
}
