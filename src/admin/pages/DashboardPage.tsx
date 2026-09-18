import {
    CircleDollarSign,
    Clock,
    Smartphone,
    Trophy,
    TriangleAlert,
    UserCheck,
    UserX,
} from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney, todayIso } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { DebtCard } from '../components/DebtCard'
import { IncomeCard } from '../components/IncomeCard'
import { MembershipFlowCard } from '../components/MembershipFlowCard'
import { RosterCard } from '../components/RosterCard'
import { QueryStatCard, StatCard } from '../components/StatCard'
import {
    activityOverdueStat,
    membershipStat,
    monthlyIncomeHint,
    pendingReceiptsHint,
} from '../lib/dashboard-row'
import { percentLabel, portalPayments, portalPaymentsHint } from '../lib/dashboard-stats'
import { toMemberCountsQuery } from '../lib/member-counts-query'
import { conceptsWithoutFee, missingFeesNotice } from '../lib/missing-fees'
import { useDashboard } from '../hooks/useDashboard'
import { useCurrentFees } from '../hooks/useFees'
import { useMemberCounts } from '../hooks/useMembers'
import {
    useDebtStats,
    useIncomeStats,
    useMembershipFlowStats,
    usePaymentMethodsStats,
    useRosterByCategoryStats,
} from '../hooks/useAdminStats'

/**
 * La ventana de los desgloses con meses. El servidor acepta de 1 a 24.
 *
 * Son los últimos 12 meses del club CONTANDO el que está corriendo
 * (`lastMonthKeys`, en el backend), así que el último todavía no cerró y el
 * porcentaje del portal se mueve solo mientras el mes avanza. El pie de esa
 * tarjeta dice "los últimos 12 meses" y no aclara la salvedad a propósito: con
 * once meses cerrados de base, el mes a medio andar mueve el número menos de lo
 * que costaría el renglón que hace falta para explicarlo. Si alguna vez se
 * acorta la ventana, la salvedad deja de ser opcional: a tres meses, el que
 * está corriendo pesa un tercio.
 */
const STATS_MONTHS = 12

/**
 * El pie de Morosos. Qué significa la marca y por qué no habla de meses: ver
 * el comentario de la tarjeta, abajo.
 */
const DELINQUENT_HINT = 'Marcados: pagan en la sede, salvo con chicos a cargo'

/**
 * El Resumen: arriba la fila de la cobranza —seis números, los mismos para
 * admin y tesorería— y, abajo, cuatro gráficos.
 *
 * Cada gráfico pide su endpoint y los cuatro salen en paralelo con los números.
 * Ninguno espera a otro ni depende de que `/admin/dashboard` responda: un
 * gráfico caído muestra su aviso adentro de su tarjeta y el resto de la
 * pantalla sigue.
 *
 * **La fila de la cobranza es una decisión del 18/09/2026.** El Resumen lo
 * abren admin y tesorería (admin web y recepción no lo ven), y la pregunta que
 * traen los dos es cómo viene la plata: cuántos tienen la membresía, qué hay
 * para revisar, cuánto entró y cuánto sin pisar la sede, qué jugadores deben la
 * actividad y quiénes quedaron marcados como morosos. Salieron tres tarjetas:
 * "Socios en el padrón", porque el total quedó adentro de Membresía vigente
 * ("262 de 450") y dos tarjetas pegadas decían una sola cosa; "Eventos
 * próximos", que no le servía a nadie que mira esta pantalla —tesorería no
 * abre Eventos y admin web no abre el Resumen—; y "Sugerencias de grupo", que
 * era solo de admin y daba un número inflado que no baja nunca (el backend
 * cuenta por tutor y no deja descartar: BACK-5 en
 * `backend/toFix/pedidos-del-frontend-2026-09-17.md`). La tarjeta y el contador
 * del menú vuelven cuando el backend cuente una sugerencia por familia.
 *
 * **Seis, y las mismas para los dos roles, es lo que hace que la grilla cierre
 * en cualquier ancho**: una columna en el teléfono, dos desde `sm` (tres filas)
 * y tres desde `xl` (dos filas). Con siete tarjetas para admin y seis para
 * tesorería siempre sobraba una en alguno de los dos. Por lo mismo ninguna se
 * esconde: las que dependen de otro endpoint se dibujan también cargando o con
 * error (`QueryStatCard`), porque cada una que falta deja una suelta.
 *
 * **Tres columnas desde `xl` y no desde `lg`**, que es donde estaban. En `lg`
 * aparece el menú de 16rem, y a 1024px, con la barra de scroll de Windows y el
 * margen, a cada tarjeta le quedan unos 165px para el número. Entraba un
 * porcentaje o un "3", pero "1200 de 1500" o "$ 12.345.678" en `text-3xl` no
 * entran en un renglón y el número se parte en dos. De 1024 a 1279px van dos
 * por fila, con unos 280px cada una; desde 1280 (1080p al 150%) quedan unos
 * 250px con tres. Vale para los dos modos: la grilla es la misma y `.dark` solo
 * reapunta colores, no el ancho de nada.
 *
 * **Cuatro gráficos es una decisión, tomada el 17/09/2026.** Hubo seis: estos
 * cuatro, "Por dónde entró la plata" y la pirámide de edades. Quedaron los que
 * cambian mes a mes y llevan a hacer algo: cobrar, llamar a quien debe, armar
 * una categoría, ver si el club gana o pierde socios. Medios de pago salió
 * porque pintaba los mismos tres celestes que Ingresos con otro significado
 * —el más oscuro era Membresía en uno y Efectivo en el otro—: dos gráficos de
 * plata de doce meses con la misma leyenda de colores y otras palabras. La
 * pirámide salió porque cambia una vez por año y porque le falta la mitad del
 * dato: el importador de CSV no tiene columna de sexo (`BulkImportDialog`) y en
 * los formularios es optativo, así que el padrón importado entero caía en el
 * contador de "sin cargar" y no en una banda. Los dos endpoints siguen en el
 * backend y las tarjetas quedan en la historia de git.
 *
 * **El dato de medios de pago volvió el mismo día, como número.** Lo que hacía
 * ruido era el gráfico —tres celestes repetidos con otro significado—, no la
 * pregunta: cuánto se paga sin pisar la sede es el único número de esta
 * pantalla que mide al PRODUCTO y no al club, y PRODUCT.md dice que el éxito se
 * mide en trámites evitados. De la dona sobrevive una cifra y se fueron el
 * reparto de tres partes, la leyenda y los importes por medio, que eran cosa de
 * conciliar y no de mirar el resumen.
 */
export const DashboardPage = () => {
    const { data, isLoading, isError } = useDashboard()

    const income = useIncomeStats(STATS_MONTHS)
    const debt = useDebtStats()
    const flow = useMembershipFlowStats(STATS_MONTHS)

    /**
     * El plantel lo usan dos: el gráfico de abajo y la tarjeta de Actividad
     * vencida. Es el mismo resultado pasado a los dos, así que es un solo
     * pedido y los dos números no pueden contradecirse.
     */
    const roster = useRosterByCategoryStats()

    /**
     * El porcentaje que entra por el portal, del mismo endpoint que dibujaba la
     * dona. Lo pide la página y no la tarjeta: la tarjeta es la misma de toda
     * la fila y solo dibuja lo que le pasan.
     */
    const methods = usePaymentMethodsStats(STATS_MONTHS)

    /**
     * Los morosos, de `GET /admin/members/counts`, que admin y tesorería pueden
     * pedir (el `@RolesProtected` del método pisa el `@Auth(ADMIN)` del
     * controlador de socios).
     *
     * **Con la MISMA key que el padrón**: `toMemberCountsQuery` del estado sin
     * búsqueda y sin "Solo jugadores" es la entrada que usa Socios al abrirse,
     * así que el número es el de la solapa "Morosos" y no puede decir otro. Y
     * cuelga de la raíz del padrón, que es lo que invalidan aprobar un pago,
     * cobrar en el mostrador y destrabar a mano: las tres cosas que sacan la
     * marca.
     */
    const counts = useMemberCounts(toMemberCountsQuery({}))

    /**
     * Los montos que rigen este mes, para el aviso de monto sin cargar.
     * `/admin/fees/current` es de admin y tesorería (`@Auth` del controlador),
     * los mismos dos que abren esta pantalla y Montos, a donde manda el aviso.
     *
     * Sale de acá y no de `/admin/pending-work`, que también lo cuenta, porque
     * ese solo devuelve CUÁNTOS faltan y el aviso tiene que decir cuáles.
     *
     * Mientras carga, o si falla, no hay aviso: una respuesta que no llegó no
     * es evidencia de que falte un monto, y Montos muestra su propio error.
     */
    const fees = useCurrentFees()

    // El mes en curso, del reloj de quien mira (ver `todayIso`): en el club, el
    // mismo que usa el backend para decidir qué rige y qué se cobró este mes.
    const month = todayIso().slice(0, 7)
    const missingFees = fees.data ? missingFeesNotice(conceptsWithoutFee(fees.data), month) : null

    return (
        <>
            <AdminPageHeader kicker="Panel admin" title="Resumen general" />

            {/* Arriba de la fila y no adentro de ella: no es un número más,
                es lo único de la pantalla que frena el cobro. Sin monto, el
                carrito y el mostrador no ofrecen ese concepto
                (`PayableService` en el backend) y nadie puede pagarlo.

                El mismo dibujo que los avisos ámbar del portal (MyPaymentsPage)
                y la misma regla (DEC-8): el ámbar en el ícono, en
                `warning-strong` porque es una marca sobre claro, y el texto en
                Tinta, porque ni el ámbar fuerte llega al 4.5:1 de un texto
                chico. El botón baja de renglón cuando no entra al lado. */}
            {missingFees && (
                <div className="mb-5 flex flex-wrap items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning-strong" />
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">
                        {missingFees}
                    </p>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/admin/montos">Ir a Montos</Link>
                    </Button>
                </div>
            )}

            {isLoading && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
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
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {/* Membresía vigente, con el padrón como total. Ni "cuota"
                        ni "al día": cuenta UNA de las tres coberturas, la única
                        que decide si entra al club (`membershipUntil >= hoy` en
                        `admin-dashboard.service.ts`), y el jugador con la
                        actividad vencida está contado adentro. Tampoco "ya la
                        pagaron" ni "del mes", por lo que explica
                        `membershipStat`.

                        Sin link, como las otras que se resolverían en Socios:
                        tesorería no lo abre (ver `StatCard`). */}
                    <StatCard label="Membresía vigente" icon={UserCheck} {...membershipStat(data)} />

                    {/* El único número que es una bandeja de trabajo, y por eso
                        el único con link —a Pagos, que abre en la solapa
                        Pendientes— y el único en ámbar cuando hay algo. Cuenta
                        solo transferencias: ver `pendingReceiptsHint`. */}
                    <StatCard
                        label="Comprobantes por revisar"
                        value={data.pendingPayments}
                        icon={Clock}
                        hint={pendingReceiptsHint(data.pendingPayments)}
                        highlight={data.pendingPayments > 0}
                        to="/admin/pagos"
                    />

                    <StatCard
                        label="Ingresos del mes"
                        value={formatMoney(data.monthlyIncome)}
                        icon={CircleDollarSign}
                        hint={monthlyIncomeHint(month)}
                    />

                    {/* Cuánto se paga sin venir a la sede. Va pegada a
                        "Ingresos del mes" porque las dos hablan de lo cobrado, y
                        el teléfono en el ícono dice de qué lado está el que
                        paga.

                        Sin `highlight`: un portal poco usado no es una tarea
                        pendiente de nadie, y el ámbar de esta pantalla es de lo
                        que alguien tiene que resolver: los comprobantes sin
                        revisar y el monto sin cargar. */}
                    <QueryStatCard
                        label="Pagos por el portal"
                        icon={Smartphone}
                        query={methods}
                        show={(stats) => {
                            const portal = portalPayments(stats)
                            return {
                                value: percentLabel(portal.share),
                                hint: portalPaymentsHint(portal, STATS_MONTHS),
                            }
                        }}
                    />

                    {/* En tono neutro, sin ámbar ni rojo: con la actividad
                        vencida el jugador no entrena, pero entra al club y no es
                        moroso (PRODUCT.md, "la cuota son tres coberturas").
                        Pintarla como deuda urgente sería mentir sobre él. */}
                    <QueryStatCard
                        label="Actividad vencida"
                        icon={Trophy}
                        query={roster}
                        show={activityOverdueStat}
                    />

                    {/* Los que tienen la MARCA de moroso (`delinquentSince`). Es
                        lo que el socio siente: el portal no le deja pagar y lo
                        manda a la sede, salvo que tenga chicos a cargo (§5.8,
                        `CartService.isBlockedByDelinquency` en el backend). De
                        ahí el pie.

                        **No es el "hace más de tres meses" del gráfico de
                        deuda**, y los dos números pueden no coincidir, para
                        arriba o para abajo. `DebtCard` cuenta el CRITERIO —la
                        membresía vencida hace más de tres meses— y esto cuenta a
                        quién se le puso la marca, que es otra cosa: la pone un
                        proceso nocturno con tope diario, nunca al personal ni a
                        quien no activó su cuenta; el alta y la importación
                        pueden traerla puesta de antes; y se saca al pagar o a
                        mano, aunque en ese caso la próxima corrida la vuelve a
                        poner si la deuda sigue. Por eso el pie dice "Marcados"
                        y no habla de meses. */}
                    <QueryStatCard
                        label="Morosos"
                        icon={UserX}
                        query={counts}
                        show={(memberCounts) => ({ value: memberCounts.delinquent, hint: DELINQUENT_HINT })}
                    />
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
