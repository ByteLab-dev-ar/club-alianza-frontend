/** `GET /admin/dashboard` — números agregados del panel. */
export interface DashboardSummary {
    totalMembers: number
    /**
     * Socios con la MEMBRESÍA vigente: `membershipUntil >= hoy` en el calendario
     * del club (`admin-dashboard.service.ts`), que es la única de las tres
     * coberturas que decide si entra al club.
     *
     * Ni "cuota" ni "al día", que es lo que decía acá: la cuota son tres
     * coberturas con vencimientos propios y este número cuenta una sola, así que
     * el jugador con la actividad vencida está contado adentro. Es el número de
     * la tarjeta "Membresía vigente · Pueden entrar al club" del Resumen.
     */
    activeMembers: number
    /** Pagos en estado PENDING esperando revisión. */
    pendingPayments: number
    upcomingEvents: number
    /** Suma de pagos aprobados dentro del mes calendario en curso. */
    monthlyIncome: number
}
