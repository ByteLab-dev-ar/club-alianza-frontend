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
    /**
     * Solo como verificación: el período real lo decide el servidor. Si este
     * valor ya no corresponde (una pantalla que quedó abierta y cambió el mes),
     * el backend responde 409 en vez de imputar el pago a otro período.
     */
    monthlyDueMonth?: string
    file: File
}

/** `NextDueResponseDto`: qué período le toca pagar al socio. */
export interface NextDue {
    /** Período a pagar, formato YYYY-MM. El socio no lo elige: lo decide el servidor. */
    month: string
    /** false mientras haya un comprobante esperando validación. */
    canPay: boolean
    /** El pago que está bloqueando, cuando canPay es false. */
    pendingPaymentId: string | null
}
