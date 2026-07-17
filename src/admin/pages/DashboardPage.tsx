import { CalendarDays, CircleDollarSign, Clock, UserCheck, Users } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { StatCard } from '../components/StatCard'
import { useDashboard } from '../hooks/useDashboard'

export const DashboardPage = () => {
    const { data, isLoading, isError } = useDashboard()

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
        </>
    )
}
