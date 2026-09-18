import { useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import {
    getDebtStatsAction,
    getIncomeStatsAction,
    getMembershipFlowStatsAction,
    getPaymentMethodsStatsAction,
    getRosterByCategoryStatsAction,
} from '../actions/stats.actions'

/*
 * Un hook por desglose: cinco queries independientes que salen en paralelo, y
 * la que falla no toca a las otras cuatro ni a los números de arriba.
 *
 * Todas las pide la página del Resumen y las cinco terminan en un gráfico, que
 * muestra su carga y su error adentro (`StatsCard`). El sexto gráfico, el de
 * Membresía, no sale de acá: usa `/admin/dashboard`, el mismo pedido que las
 * tarjetas de arriba.
 *
 * Las keys cuelgan de `QK.adminDashboard` y no de una raíz propia, a propósito:
 * son los números de esa pantalla desglosados, y cada mutación que ya invalida
 * el resumen —aprobar un pago, cobrar en el mostrador, dar de alta o archivar
 * un socio— cambia también los gráficos. Con una raíz aparte, cada una de esas
 * invalidaciones tendría que acordarse de una segunda línea.
 */

const STALE_TIME = 1000 * 60

export const useIncomeStats = (months: number) => {
    return useQuery({
        queryKey: [QK.adminDashboard, 'income', { months }],
        queryFn: () => getIncomeStatsAction(months),
        staleTime: STALE_TIME,
    })
}

/**
 * Medios de pago. **Sin `enabled`**, como todo `/admin/stats/*`: el endpoint es
 * ADMIN y ACCOUNTANT, los mismos dos roles que pueden abrir el Resumen, así
 * que no hay quien lo pida y se coma un 403.
 */
export const usePaymentMethodsStats = (months: number) => {
    return useQuery({
        queryKey: [QK.adminDashboard, 'payment-methods', { months }],
        queryFn: () => getPaymentMethodsStatsAction(months),
        staleTime: STALE_TIME,
    })
}

export const useDebtStats = () => {
    return useQuery({
        queryKey: [QK.adminDashboard, 'debt'],
        queryFn: getDebtStatsAction,
        staleTime: STALE_TIME,
    })
}

export const useRosterByCategoryStats = () => {
    return useQuery({
        queryKey: [QK.adminDashboard, 'roster-by-category'],
        queryFn: getRosterByCategoryStatsAction,
        staleTime: STALE_TIME,
    })
}

export const useMembershipFlowStats = (months: number) => {
    return useQuery({
        queryKey: [QK.adminDashboard, 'membership-flow', { months }],
        queryFn: () => getMembershipFlowStatsAction(months),
        staleTime: STALE_TIME,
    })
}
