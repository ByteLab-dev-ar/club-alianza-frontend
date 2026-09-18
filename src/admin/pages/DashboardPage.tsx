import { CircleDollarSign, Clock, TriangleAlert, Users } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney, todayIso } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { DebtCard } from '../components/DebtCard'
import { IncomeCard } from '../components/IncomeCard'
import { MembershipCard } from '../components/MembershipCard'
import { MembershipFlowCard } from '../components/MembershipFlowCard'
import { PaymentMethodsCard } from '../components/PaymentMethodsCard'
import { RosterCard } from '../components/RosterCard'
import { StatCard } from '../components/StatCard'
import { TOTAL_MEMBERS_HINT, monthlyIncomeHint, pendingTransfersHint } from '../lib/dashboard-row'
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
 * reparto de "Por dónde entra la plata" se mueve solo mientras el mes avanza.
 * El pie de ese gráfico dice "los últimos 12 meses" y no aclara la salvedad a
 * propósito: con once meses cerrados de base, el mes a medio andar mueve el
 * número menos de lo que costaría el renglón que hace falta para explicarlo. Si
 * alguna vez se acorta la ventana, la salvedad deja de ser opcional: a tres
 * meses, el que está corriendo pesa un tercio.
 */
const STATS_MONTHS = 12

/**
 * El Resumen: arriba tres números —las transferencias por revisar, lo que
 * entró este mes y el padrón— y abajo seis gráficos. Es igual para admin y
 * tesorería, los dos roles que lo abren (admin web y recepción no lo ven).
 *
 * **Gráficos y no tarjetas, por decisión del dueño (18/09/2026).** El mismo día
 * el Resumen había pasado a una fila de seis números de la cobranza, y el dueño
 * prefirió leerla en gráficos: un número suelto dice cuánto, y el gráfico dice
 * además contra qué —vigentes contra el padrón, el portal contra la sede—. De
 * la fila quedan los tres que son un número y nada más:
 *
 * - "Transferencias por revisar", la única bandeja de trabajo de la pantalla.
 *   Se llamaba "Comprobantes por revisar", y el pie tenía que aclarar que eran
 *   solo transferencias; con el nombre nuevo lo dice el rótulo.
 * - "Ingresos del mes", lo cobrado este mes, que ningún gráfico dice solo.
 * - "Total de socios", el padrón, que es la base de todo lo de abajo.
 *
 * Y el resto pasó a gráficos:
 *
 * - "Membresía vigente" y "Morosos" son el gráfico de Membresía: la barra del
 *   padrón con vigentes y vencidas, y los morosos en su pie, porque no son un
 *   pedazo de las vencidas (el porqué, en `MembershipCard`).
 * - "Pagos por el portal" es otra vez "Por dónde entra la plata", que había
 *   salido el 17/09 (ver abajo) y vuelve en barras y con otros colores.
 * - "Actividad vencida" no tiene gráfico propio: Plantel ya la muestra, por
 *   categoría, y dos veces la misma cosa en la pantalla no ayuda a leerla.
 *
 * Cada gráfico pide su endpoint y todos salen en paralelo con los números.
 * Ninguno espera a otro: un gráfico caído muestra su aviso adentro de su
 * tarjeta y el resto de la pantalla sigue (`StatsCard`). El de Membresía usa
 * `/admin/dashboard`, el mismo pedido que las tarjetas, así que si ese cae se
 * caen los dos; los morosos de su pie son otro pedido y fallan solos.
 *
 * **La historia de los gráficos.** El 17/09/2026 quedaron cuatro de seis: se
 * fue la pirámide de edades, porque cambia una vez por año y le falta la mitad
 * del dato —el importador de CSV no tiene columna de sexo (`BulkImportDialog`)
 * y en los formularios es optativo, así que el padrón importado entero caía en
 * "sin cargar"—, y se fue "Por dónde entró la plata", porque pintaba los mismos
 * tres celestes que Ingresos con otro significado —el más oscuro era Membresía
 * en uno y Efectivo en el otro—. La pregunta de ese gráfico no era el
 * problema: cuánto se paga sin pisar la sede es lo único de esta pantalla que
 * mide al PRODUCTO y no al club, y PRODUCT.md dice que el éxito se mide en
 * trámites evitados. Por eso vuelve, contando pagos y no pesos, y pintado por
 * canal —el portal en `--chart-single`, la sede en gris— y no con la rampa (ver
 * `PaymentMethodsCard`). El endpoint de la pirámide sigue en el backend y su
 * tarjeta en la historia de git.
 *
 * **Las que salieron de la fila antes**, y siguen afuera: "Eventos próximos",
 * que no le servía a nadie que mira esta pantalla —tesorería no abre Eventos y
 * admin web no abre el Resumen—, y "Sugerencias de grupo", que era solo de
 * admin y daba un número inflado que no baja nunca (el backend cuenta por tutor
 * y no deja descartar: BACK-5 en `backend/toFix/pedidos-del-frontend-2026-09-17.md`).
 * La tarjeta y el contador del menú vuelven cuando el backend cuente una
 * sugerencia por familia.
 */
export const DashboardPage = () => {
    // El mismo resultado para las tarjetas y para el gráfico de Membresía: un
    // solo pedido, así que "Total de socios" y el total de la barra no pueden
    // salir de dos respuestas distintas.
    const dashboard = useDashboard()
    const { data, isLoading, isError } = dashboard

    const income = useIncomeStats(STATS_MONTHS)
    const flow = useMembershipFlowStats(STATS_MONTHS)
    const methods = usePaymentMethodsStats(STATS_MONTHS)
    const debt = useDebtStats()
    const roster = useRosterByCategoryStats()

    /**
     * Los morosos del pie de Membresía, de `GET /admin/members/counts`, que
     * admin y tesorería pueden pedir (el `@RolesProtected` del método pisa el
     * `@Auth(ADMIN)` del controlador de socios).
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

    /*
     * Una columna en el teléfono y tres donde entran, que no es un solo corte:
     * en `lg` aparece el menú de 16rem y le saca a la fila más de lo que la
     * ventana le suma.
     *
     * La cuenta: "$ 12.345.678" en `text-3xl` y en Hanken Grotesk 900 mide unos
     * 190px, y el número no puede partirse —`formatMoney` separa el signo con un
     * espacio duro—, así que se sale de la tarjeta si no entra. Con 24px de
     * relleno y 1px de borde por lado, cada tarjeta pide ~215px adentro, o sea
     * 265px, y las tres con 1,25rem entre ellas, 835px de fila.
     *
     * - Sin el menú (hasta `lg`) la página tiene 2rem de margen por lado y la
     *   barra de scroll de Windows (el Resumen siempre scrollea) come 15 a 17px:
     *   la fila llega a 835px desde 916px de ventana. De ahí `min-[58rem]`.
     * - En `lg` aparece el menú y a 1024px la fila vuelve a medir 687px: cada
     *   número tendría 165px. Las tres recién vuelven a entrar a los 1172px, y
     *   mientras tanto van de a UNA otra vez, y no de a dos: con tres tarjetas,
     *   dos por fila deja una sola abajo, y una suelta se lee como que falta
     *   algo.
     * - Desde `min-[74rem]` (1184px), tres con el menú. 1080p al 150% (1280px)
     *   entra con aire.
     *
     * Va igual para los dos modos: `.dark` solo reapunta colores, no el ancho
     * de nada.
     */
    const statsGrid = 'grid gap-5 min-[58rem]:grid-cols-3 lg:grid-cols-1 min-[74rem]:grid-cols-3'

    return (
        <>
            <AdminPageHeader kicker="Panel admin" title="Resumen general" />

            {/* Arriba de las tarjetas y no adentro de ellas: no es un número
                más, es lo único de la pantalla que frena el cobro. Sin monto, el
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
                <div className={statsGrid}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-32 rounded-xl" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    No pudimos cargar estos números. Probá recargar en unos minutos.
                </p>
            )}

            {data && (
                <div className={statsGrid}>
                    {/* El único número que es una bandeja de trabajo, y por eso
                        el único con link —a Pagos, que abre en la solapa
                        Pendientes— y el único en ámbar cuando hay algo. Cuenta
                        solo transferencias: ver `pendingTransfersHint`. */}
                    <StatCard
                        label="Transferencias por revisar"
                        value={data.pendingPayments}
                        icon={Clock}
                        hint={pendingTransfersHint(data.pendingPayments)}
                        highlight={data.pendingPayments > 0}
                        to="/admin/pagos"
                    />

                    <StatCard
                        label="Ingresos del mes"
                        value={formatMoney(data.monthlyIncome)}
                        icon={CircleDollarSign}
                        hint={monthlyIncomeHint(month)}
                    />

                    {/* El padrón entero, del mismo pedido que el gráfico de
                        Membresía: el total de la tarjeta y el de la barra son
                        el mismo número. Sin link, por lo que explica `StatCard`. */}
                    <StatCard
                        label="Total de socios"
                        value={data.totalMembers}
                        icon={Users}
                        hint={TOTAL_MEMBERS_HINT}
                    />
                </div>
            )}

            {/* Dos columnas desde 81rem (1296px) y una más abajo. El corte sale
                de una cuenta y no de la escala de Tailwind: el gráfico no baja
                de 26rem (el `min-w-[26rem]` de cada SVG, explicado en
                StatsCard), así que cada columna pide 26rem + 3rem de relleno +
                2px de borde = 466px, y con el menú de 16rem, 2rem de margen por
                lado y 1,25rem entre tarjetas las dos columnas necesitan 1272px
                de ventana SIN la barra de scroll. La de Windows mide 15 a 17px,
                el Resumen siempre scrollea y el breakpoint la cuenta dentro del
                ancho: en `xl` (1280px, que es 1080p con la escala al 150%) a
                cada gráfico le faltaban unos 4px y la tarjeta mostraba una
                barrita de scroll de costado. Uno por fila entra sin scroll desde
                1024px, con 200px de sobra. A 1920px cada tarjeta mide unos
                780px para un gráfico de 460, que no se estira: el aire queda a
                la derecha.

                El orden va de a pares, y cada par habla de lo mismo: la plata
                y el padrón mes a mes, arriba; cómo está el padrón hoy y por
                dónde paga, al medio; y lo que se debe —la membresía por
                antigüedad, la actividad por categoría—, abajo. En una columna
                es el mismo orden. */}
            <div className="mt-5 grid gap-5 min-[81rem]:grid-cols-2">
                <IncomeCard query={income} months={STATS_MONTHS} />
                <MembershipFlowCard query={flow} months={STATS_MONTHS} />

                <MembershipCard
                    query={dashboard}
                    delinquent={{ data: counts.data?.delinquent, isError: counts.isError }}
                />
                <PaymentMethodsCard query={methods} months={STATS_MONTHS} />

                <DebtCard query={debt} />
                <RosterCard query={roster} />
            </div>
        </>
    )
}
