import type { Payment, PaymentStatus } from '@/payments/interfaces/Payment'

/** Resumen del socio dueño del pago (y del staff que lo validó). */
export interface PaymentUserSummary {
    id: string
    email: string
    name: string | null
    surname: string | null
    memberNumber: string | null
}

/**
 * `AdminPaymentResponseDto`: extiende el pago del socio con quién pagó y quién
 * validó — datos que el socio no ve en su propia vista.
 */
export interface AdminPayment extends Payment {
    user: PaymentUserSummary
    validatedBy: PaymentUserSummary | null
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
