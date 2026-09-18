import { formatCalendarDate } from '@/lib/format'

/*
 * Los pies de las tres tarjetas del Resumen: la frase de abajo de cada número,
 * que dice qué cuenta.
 *
 * `StatCard` recibe textos armados, así que lo que se decide al escribirlos
 * —el singular, qué decir en cero, el nombre del mes— vive acá, donde se prueba
 * sin DOM, y no en la página. El reparto de la membresía y el de los medios de
 * pago, que hasta el 18/09/2026 eran tarjetas de esta fila, pasaron a ser
 * gráficos y viven en `dashboard-stats`.
 */

/**
 * El pie de "Transferencias por revisar".
 *
 * El rótulo ya dice qué se cuenta —el nombre viejo, "Pagos pendientes",
 * prometía otra cosa—, así que el pie solo dice en qué estado están: son solo
 * TRANSFERENCIAS (`countPaymentsAwaitingReview` en el backend), las mismas que
 * la solapa Pendientes de Pagos. Un Mercado Pago pendiente lo resuelve el
 * proveedor y el efectivo nace aprobado: ninguno de los dos espera a nadie del
 * club.
 *
 * En cero, "Nada para revisar" y no "Todo al día", que era lo que decía: con
 * tres coberturas, "al día" se lee como "nadie debe nada" (PRODUCT.md), y una
 * bandeja vacía no dice eso.
 */
export const pendingTransfersHint = (count: number): string =>
    count === 0 ? 'Nada para revisar' : 'Esperando revisión'

/**
 * El pie de "Total de socios": que el número es el padrón entero y no los que
 * pagaron.
 *
 * Cuenta a los socios dados de alta y sin archivar (`membershipStatus =
 * MEMBER` en `admin-dashboard.service.ts`, sin los dados de baja), con la
 * membresía como esté. Por estado de afiliación y no por rol, así que el
 * tesorero que además es socio está contado, y el chico sin cuenta también: se
 * cuenta el perfil, no el login.
 *
 * "Vigente o vencida" y no "al día o no": la palabra de la membresía es
 * "vigente" (`membership-label.ts`). Y dice la membresía y no "socios
 * vigentes", porque "vigente" a secas ya significa otra cosa en este producto:
 * el perfil que no está dado de baja.
 */
export const TOTAL_MEMBERS_HINT = 'Con la membresía vigente o vencida'

/**
 * El pie de "Ingresos del mes": de qué mes habla y que todavía no cerró.
 *
 * "Aprobados en" y no "de": el backend suma por la fecha de APROBACIÓN
 * (`validatedAt` dentro del mes del club), no por el período que cubre cada
 * pago, así que la transferencia de agosto aprobada el 2 de septiembre cuenta
 * en septiembre. Y "hasta hoy" porque, sin la aclaración, el número de un mes a
 * medio andar se compara con el mes entero anterior y parece una caída.
 *
 * `month` es `YYYY-MM`. El nombre se calcula y no se escribe: la frase tiene
 * que cambiar sola el primero de cada mes.
 */
export const monthlyIncomeHint = (month: string): string =>
    `Pagos aprobados en ${formatCalendarDate(`${month}-01`, 'MMMM')}, hasta hoy`
