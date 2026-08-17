import type { Payment, PaymentStatus } from '@/payments/interfaces/Payment'

/** Resumen del socio dueño del pago (y del staff que lo validó). */
export interface PaymentUserSummary {
    id: string
    email: string
    name: string | null
    surname: string | null
    memberNumber: number | null
}

/**
 * `AdminPaymentResponseDto`: extiende el pago del socio con quién pagó y quién
 * validó — datos que el socio no ve en su propia vista.
 */
export interface AdminPayment extends Payment {
    user: PaymentUserSummary
    validatedBy: PaymentUserSummary | null
}

/**
 * Qué pasó con la cobertura del socio al aprobar el pago.
 *
 * Reemplaza a un `coverageExtended: boolean` donde `false` mezclaba dos cosas
 * muy distintas: "era una cuota pero ya estaba cubierto" —que hay que avisar— y
 * "no era un pago de cuota", que es normal y no amerita nada.
 */
export type CoverageOutcome = 'extended' | 'already_covered' | 'not_a_membership_payment'

/**
 * Lo que devuelve APROBAR un pago: el mismo shape del listado más el resultado
 * de la operación.
 *
 * `coverageOutcome` va en un tipo aparte y no como campo opcional de
 * `AdminPayment` porque no es una propiedad del pago —el listado no lo trae— sino
 * el desenlace de aprobarlo. Como opcional quedaría `undefined` en cada fila de
 * la tabla, invitando a preguntarle algo que ahí nunca sabe.
 */
export interface ApprovedPayment extends AdminPayment {
    /**
     * - `extended`: movió la fecha de vencimiento. Lo normal.
     * - `already_covered`: quedó aprobado pero NO movió nada, porque el socio ya
     *   estaba cubierto hasta ese mes o más allá. Si tesorería no se entera, el
     *   pago no otorga nada y nadie lo nota.
     * - `not_a_membership_payment`: no era cuota, no correspondía extender.
     */
    coverageOutcome: CoverageOutcome
}

export interface AdminPaymentsQuery {
    /** Desde 1. El backend rechaza `limit` mayor a 100 con un 400. */
    page?: number
    limit?: number
    status?: PaymentStatus
    startDate?: string
    /** Inclusive: incluye el día completo, hasta las 23:59:59. */
    endDate?: string
}
