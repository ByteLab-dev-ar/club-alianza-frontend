/**
 * `GET /admin/dashboard` — números agregados del panel.
 *
 * El backend también devuelve `upcomingEvents`, y el front lo dejó de leer el
 * 18/09/2026 junto con la tarjeta "Eventos próximos" (ver `DashboardPage`):
 * por eso no está en el tipo, aunque siga viajando.
 */
export interface DashboardSummary {
    /**
     * Socios dados de alta y sin archivar: el estado de afiliación, no el rol,
     * así que el tesorero que además es socio está contado. Es la tarjeta
     * "Total de socios" del Resumen y el total de la barra de Membresía.
     */
    totalMembers: number
    /**
     * Socios con la MEMBRESÍA vigente: `membershipUntil >= hoy` en el calendario
     * del club (`admin-dashboard.service.ts`), que es la única de las tres
     * coberturas que decide si entra al club.
     *
     * Ni "cuota" ni "al día", que es lo que decía acá: la cuota son tres
     * coberturas con vencimientos propios y este número cuenta una sola, así que
     * el jugador con la actividad vencida está contado adentro. Tampoco "los que
     * pagaron este mes": el vencimiento también se carga a mano, con fechas
     * futuras, en el alta, la importación y la ficha. Es el tramo "vigentes"
     * de la barra de Membresía del Resumen.
     */
    activeMembers: number
    /**
     * Transferencias esperando revisión, sin filtro de fecha. Sale de
     * `countPaymentsAwaitingReview` (`pending-work.service.ts`), el mismo
     * criterio que la solapa Pendientes de Pagos: no cuenta los Mercado Pago
     * pendientes, que los resuelve el proveedor, ni el efectivo, que nace
     * aprobado. Decía "Pagos en estado PENDING", que era el criterio viejo y
     * sumaba checkouts abandonados que nadie tiene que revisar. Es la tarjeta
     * "Transferencias por revisar" del Resumen.
     */
    pendingPayments: number
    /**
     * Suma de los pagos APROBADOS dentro del mes calendario del club, por la
     * fecha de aprobación (`validatedAt`) y no por el período que cubren.
     */
    monthlyIncome: number
}
