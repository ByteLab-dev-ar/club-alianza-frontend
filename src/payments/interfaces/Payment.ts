export const PaymentStatuses = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    REFUNDED: 'REFUNDED',
} as const

export type PaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    REFUNDED: 'Reintegrado',
}

/** `PaymentResponseDto`: la vista del propio socio (sin quién lo validó). */
export interface Payment {
    id: string
    amount: number
    paymentDate: string
    type: 'MEMBERSHIP'
    /** Mes de la cuota en formato YYYY-MM. */
    metadataMonth: string | null
    receiptUrl: string | null
    status: PaymentStatus
    validatedAt: string | null
    rejectionReason: string | null
    createdAt: string
}

export interface CreatePaymentPayload {
    amount: number
    paymentDate?: string
    monthlyDueMonth?: string
    file: File
}
