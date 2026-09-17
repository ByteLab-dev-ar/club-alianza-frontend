import { CalendarDays, CircleDollarSign, Clock, UserCheck, Users, UsersRound } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/format'
import { useAuthStore } from '@/auth/store/auth.store'
import { Roles } from '@/constants/roles'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { DebtCard } from '../components/DebtCard'
import { IncomeCard } from '../components/IncomeCard'
import { MembershipFlowCard } from '../components/MembershipFlowCard'
import { RosterCard } from '../components/RosterCard'
import { StatCard } from '../components/StatCard'
import { useDashboard } from '../hooks/useDashboard'
import { useFamilyGroupSuggestions } from '../hooks/useFamilyGroups'
import {
    useDebtStats,
    useIncomeStats,
    useMembershipFlowStats,
    useRosterByCategoryStats,
} from '../hooks/useAdminStats'

/** La ventana de los gráficos con meses. El servidor acepta de 1 a 24. */
const STATS_MONTHS = 12

/**
 * El Resumen: arriba los números —seis para admin, cinco para tesorería, que no
 * ve las sugerencias de grupo— y, abajo, cuatro gráficos.
 *
 * Cada gráfico pide su endpoint y los cuatro salen en paralelo con los números.
 * Ninguno espera a otro ni depende de que `/admin/dashboard` responda: una
 * tarjeta caída muestra su aviso y el resto de la pantalla sigue.
 *
 * **Cuatro es una decisión, tomada el 17/09/2026.** Hubo seis: estos cuatro,
 * "Por dónde entró la plata" y la pirámide de edades. Quedaron los que cambian
 * mes a mes y llevan a hacer algo: cobrar, llamar a quien debe, armar una
 * categoría, ver si el club gana o pierde socios. Medios de pago salió porque
 * pintaba los mismos tres celestes que Ingresos con otro significado —el más
 * oscuro era Membresía en uno y Efectivo en el otro—: dos gráficos de plata de
 * doce meses con la misma leyenda de colores y otras palabras. La pirámide
 * salió porque cambia una vez por año y porque le falta la mitad del dato: el
 * importador de CSV no tiene columna de sexo (`BulkImportDialog`) y en los
 * formularios es optativo, así que el padrón importado entero caía en el
 * contador de "sin cargar" y no en una banda. Los dos endpoints siguen en el
 * backend y las tarjetas quedan en la historia de git.
 */
export const DashboardPage = () => {
    const { data, isLoading, isError } = useDashboard()

    const income = useIncomeStats(STATS_MONTHS)
    const debt = useDebtStats()
    const roster = useRosterByCategoryStats()
    const flow = useMembershipFlowStats(STATS_MONTHS)

    /**
     * Las sugerencias de grupo, solo para admin (DEC-2).
     *
     * El Resumen lo ven admin y tesorería, pero el endpoint es de ADMIN: a
     * nombre de tesorería contestaría 403, así que el freno va en el pedido y no
     * solo en el dibujo de la tarjeta. Es la MISMA query que la pantalla de
     * Grupos familiares —misma key—, así que la tarjeta no agrega un pedido y no
     * puede decir un número distinto del que muestra esa pantalla.
     */
    const isAdmin = useAuthStore((state) => state.is(Roles.ADMIN))
    const suggestions = useFamilyGroupSuggestions({ enabled: isAdmin })

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
                    {/* Los dos primeros números son distintos y las palabras lo
                        dicen ahora (MEN-2). Antes el primero repetía en su
                        aclaración el número del segundo —"N con la cuota al
                        día"—, así que la misma cifra aparecía dos veces en dos
                        tarjetas pegadas y parecía un error de cálculo.

                        Y ni "cuota" ni "al día": desde §5 la cuota son TRES
                        coberturas con vencimientos propios (membresía, actividad
                        y seguro), y este número cuenta solo la membresía
                        vigente, que es la única que decide si entra al club
                        (`membershipUntil >= hoy` en
                        `admin-dashboard.service.ts`). "Al día" se lee como
                        "está todo bien" y acá puede tener la actividad vencida,
                        que no lo bloquea ni lo hace moroso. Por eso se escribe
                        por lo que habilita —"Pueden entrar al club"—, igual que
                        las bandas de la puerta (PRODUCT.md). */}
                    <StatCard
                        label="Socios en el padrón"
                        value={data.totalMembers}
                        icon={Users}
                        hint="Dados de alta, con la membresía vigente o no"
                    />
                    <StatCard
                        label="Membresía vigente"
                        value={data.activeMembers}
                        icon={UserCheck}
                        hint="Pueden entrar al club"
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

                    {/* La sexta tarjeta, solo para admin (DEC-2): completa la
                        fila de tres que hasta ahora quedaba con un hueco.

                        **Sin el ámbar de "Pagos pendientes"**, aunque copie todo
                        lo demás: un comprobante sin revisar es plata esperando y
                        una sugerencia no es una deuda ni una tarea obligatoria
                        —el club puede decidir no agrupar a esa familia—. Además
                        el número sale inflado y no baja nunca (el backend agrupa
                        por tutor y no se puede descartar una sugerencia: está
                        pedido en `backend/toFix/pedidos-del-frontend-2026-09-17.md`,
                        BACK-5), y un resaltado permanente se vuelve ruido.

                        Con 0 se muestra igual, no se esconde: así "no hay
                        ninguna" se distingue de "la lista no cargó", que es el
                        único caso en que la tarjeta no está. */}
                    {suggestions.data && (
                        <StatCard
                            label="Sugerencias de grupo"
                            value={suggestions.data.length}
                            icon={UsersRound}
                            hint={
                                suggestions.data.length > 0
                                    ? 'Comparten tutor y no tienen grupo'
                                    : 'Nada para revisar'
                            }
                            to="/admin/grupos-familiares"
                        />
                    )}
                </div>
            )}

            {/* 2×2 desde 81rem (1296px) y uno por fila más abajo. El corte sale
                de una cuenta y no de la escala de Tailwind: el gráfico no baja
                de 26rem (el `min-w-[26rem]` de cada SVG, explicado en
                StatsCard), así que cada columna pide 26rem + 3rem de relleno +
                2px de borde = 466px, y con el menú de 16rem, 2rem de margen por
                lado y 1,25rem entre tarjetas el 2×2 necesita 1272px de ventana
                SIN la barra de scroll. La de Windows mide 15 a 17px, el Resumen
                siempre scrollea y el breakpoint la cuenta dentro del ancho: en
                `xl` (1280px, que es 1080p con la escala al 150%) a cada gráfico
                le faltaban unos 4px y la tarjeta mostraba una barrita de scroll
                de costado. Uno por fila entra sin scroll desde 1024px, con
                200px de sobra. A 1920px cada tarjeta mide unos 780px para un
                gráfico de 460, que no se estira: el aire queda a la derecha. */}
            <div className="mt-5 grid gap-5 min-[81rem]:grid-cols-2">
                <IncomeCard query={income} months={STATS_MONTHS} />
                <MembershipFlowCard query={flow} months={STATS_MONTHS} />

                <DebtCard query={debt} />
                <RosterCard query={roster} />
            </div>
        </>
    )
}
