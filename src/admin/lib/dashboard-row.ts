import { formatCalendarDate } from '@/lib/format'
import type { RosterByCategoryStats } from '../interfaces/AdminStats'
import type { DashboardSummary } from '../interfaces/DashboardSummary'
import { percentLabel, rosterSummary } from './dashboard-stats'

/*
 * La fila de la cobranza del Resumen: el número de cada tarjeta ya escrito y
 * el pie que dice qué cuenta.
 *
 * `StatCard` recibe textos armados, así que lo que se decide al escribirlos
 * —el total después del "de", el porcentaje, el singular, qué mostrar con el
 * padrón vacío— vive acá, donde se prueba sin DOM, y no en la página.
 */

/** Lo que dibuja una tarjeta: el número y la frase de abajo. */
export interface StatText {
    value: string
    hint: string
}

/**
 * "262 de 450". El total va pegado al número porque una parte sola no se lee:
 * 37 jugadores con la actividad vencida es mucho en un plantel de 60 y poco en
 * uno de 400, y sin el "de" hay que ir a buscar el otro número a otro lado.
 */
export const partOfTotal = (part: number, total: number): string => `${part} de ${total}`

/**
 * Membresía vigente, con el padrón adentro.
 *
 * Reemplaza a dos tarjetas —"Socios en el padrón" y la vieja "Membresía
 * vigente"—, que puestas una al lado de la otra decían una sola cosa: el total
 * pasa a ser el "de" del número y el porcentaje va al pie.
 *
 * El pie dice "del padrón" y **no "ya la pagaron" ni "del mes"**: el
 * vencimiento de la membresía también se carga a mano, con fechas futuras, en
 * el alta, en la importación y al corregir la ficha
 * (`admin-members.service.ts`, `normalizeCoverageEnd`). El número cuenta
 * quiénes tienen la membresía vigente hoy, que es lo que decide si entran al
 * club, no quiénes pagaron este mes.
 *
 * Con el padrón vacío no hay porcentaje —0 de 0 no es un 0%— y un "0 de 0" se
 * lee como un error de cálculo, así que se dice lo que pasa.
 */
export const membershipStat = ({
    activeMembers,
    totalMembers,
}: Pick<DashboardSummary, 'activeMembers' | 'totalMembers'>): StatText => {
    if (totalMembers === 0) return { value: '0', hint: 'Todavía no hay socios en el padrón' }

    return {
        value: partOfTotal(activeMembers, totalMembers),
        hint: `El ${percentLabel(activeMembers / totalMembers)} del padrón`,
    }
}

/**
 * Actividad vencida: cuántos jugadores la deben, de cuántos jugadores.
 *
 * Sale de `/admin/stats/roster-by-category`, el mismo pedido que dibuja
 * "Plantel por categoría" más abajo, así que el número y el gráfico no pueden
 * contradecirse. Por eso el total es el de ese gráfico —los jugadores CON
 * categoría— y deja afuera a los que no tienen ninguna posible: de esos el
 * endpoint no dice si pagaron, y sumarlos al total sin poder contarlos en la
 * parte achicaría la proporción de mentira. El gráfico los nombra aparte.
 *
 * Sin jugadores, lo mismo que con el padrón vacío: "0 de 0" parece un error.
 */
export const activityOverdueStat = (stats: RosterByCategoryStats): StatText => {
    const { players, notUpToDate } = rosterSummary(stats)

    if (players === 0) return { value: '0', hint: 'No hay jugadores con categoría' }

    return { value: partOfTotal(notUpToDate, players), hint: 'Jugadores que deben la actividad' }
}

/**
 * El pie de "Comprobantes por revisar".
 *
 * Dice qué se cuenta porque el nombre viejo, "Pagos pendientes", prometía otra
 * cosa: son solo TRANSFERENCIAS (`countPaymentsAwaitingReview` en el backend),
 * las mismas que la solapa Pendientes de Pagos. Un Mercado Pago pendiente lo
 * resuelve el proveedor y el efectivo nace aprobado: ninguno de los dos espera
 * a nadie del club.
 *
 * En cero, "Nada para revisar" y no "Todo al día", que era lo que decía: con
 * tres coberturas, "al día" se lee como "nadie debe nada" (PRODUCT.md), y una
 * bandeja vacía no dice eso.
 */
export const pendingReceiptsHint = (count: number): string => {
    if (count === 0) return 'Nada para revisar'

    return count === 1 ? 'Transferencia esperando revisión' : 'Transferencias esperando revisión'
}

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
