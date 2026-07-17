/** `GET /admin/dashboard` — números agregados del panel. */
export interface DashboardSummary {
    totalMembers: number
    /** Socios con la cuota al día. */
    activeMembers: number
    /** Pagos en estado PENDING esperando revisión. */
    pendingPayments: number
    upcomingEvents: number
    /** Suma de pagos aprobados dentro del mes calendario en curso. */
    monthlyIncome: number
}
