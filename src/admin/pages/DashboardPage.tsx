import { CalendarDays, CircleDollarSign, Clock, UserCheck, Users } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AgePyramidCard } from '../components/AgePyramidCard'
import { DebtCard } from '../components/DebtCard'
import { IncomeCard } from '../components/IncomeCard'
import { MembershipFlowCard } from '../components/MembershipFlowCard'
import { PaymentMethodsCard } from '../components/PaymentMethodsCard'
import { RosterCard } from '../components/RosterCard'
import { StatCard } from '../components/StatCard'
import { useDashboard } from '../hooks/useDashboard'
import {
    useAgePyramidStats,
    useDebtStats,
    useIncomeStats,
    useMembershipFlowStats,
    usePaymentMethodsStats,
    useRosterByCategoryStats,
} from '../hooks/useAdminStats'

/** La ventana de los gráficos con meses. El servidor acepta de 1 a 24. */
const STATS_MONTHS = 12

/**
 * El Resumen: los cinco números de siempre y, abajo, seis gráficos.
 *
 * Cada gráfico pide su endpoint y los seis salen en paralelo con los números.
 * Ninguno espera a otro ni depende de que `/admin/dashboard` responda: una
 * tarjeta caída muestra su aviso y el resto de la pantalla sigue.
 *
 * **Seis es una decisión pendiente.** La maqueta advertía que son demasiados
 * para una pantalla —entre otras cosas, ingresos y medios de pago comparten
 * los tres colores con significados distintos— y proponía elegir tres o
 * cuatro. Nadie eligió todavía, así que van los seis en el orden de la maqueta.
 */
export const DashboardPage = () => {
    const { data, isLoading, isError } = useDashboard()

    const income = useIncomeStats(STATS_MONTHS)
    const debt = useDebtStats()
    const roster = useRosterByCategoryStats()
    const flow = useMembershipFlowStats(STATS_MONTHS)
    const methods = usePaymentMethodsStats(STATS_MONTHS)
    const pyramid = useAgePyramidStats()

    return (
        <>
            <AdminPageHeader kicker="Panel admin" title="Resumen general" />

            {isLoading && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-32 rounded-xl" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    No pudimos cargar el resumen. Probá recargar en unos minutos.
                </p>
            )}

            {data && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        label="Socios totales"
                        value={data.totalMembers}
                        icon={Users}
                        hint={`${data.activeMembers} con la cuota al día`}
                    />
                    <StatCard
                        label="Socios activos"
                        value={data.activeMembers}
                        icon={UserCheck}
                        hint="Cuota vigente"
                    />
                    <StatCard
                        label="Pagos pendientes"
                        value={data.pendingPayments}
                        icon={Clock}
                        hint={data.pendingPayments > 0 ? 'Esperando revisión' : 'Todo al día'}
                        highlight={data.pendingPayments > 0}
                    />
                    <StatCard
                        label="Eventos próximos"
                        value={data.upcomingEvents}
                        icon={CalendarDays}
                        hint="De hoy en adelante"
                    />
                    <StatCard
                        label="Ingresos del mes"
                        value={formatMoney(data.monthlyIncome)}
                        icon={CircleDollarSign}
                        hint="Pagos aprobados este mes"
                    />
                </div>
            )}

            {/* De a tres desde 2xl, alineadas con los números de arriba: de a dos, en
                una pantalla de 1080p cada tarjeta medía casi 800px para un gráfico
                de 460. Todos los gráficos miden lo mismo (ver el ancho máximo en
                StatsCard), así que las seis tarjetas quedan parejas. Entre lg y xl
                la mitad no alcanza para doce meses sin scroll: ahí los dos por mes
                ocupan la fila entera. */}
            <div className="mt-5 grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                <IncomeCard query={income} months={STATS_MONTHS} className="lg:col-span-2 xl:col-span-1" />
                <MembershipFlowCard query={flow} months={STATS_MONTHS} className="lg:col-span-2 xl:col-span-1" />

                <DebtCard query={debt} />
                <RosterCard query={roster} />

                <PaymentMethodsCard query={methods} months={STATS_MONTHS} />
                <AgePyramidCard query={pyramid} />
            </div>
        </>
    )
}
