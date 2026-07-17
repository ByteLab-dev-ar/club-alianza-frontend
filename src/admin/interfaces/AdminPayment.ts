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
    status?: PaymentStatus
    startDate?: string
    endDate?: string
}
