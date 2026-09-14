import { useState } from 'react'

import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { compactMoney, donutSegments, ringSegmentPath } from '../lib/chart-geometry'
import { paymentMethodsSummary, percentLabel } from '../lib/dashboard-stats'
import type { PaymentMethodsStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: PaymentMethodsStats | undefined; isLoading: boolean; isError: boolean }
    months: number
}

/**
 * Los colores van por POSICIÓN y el contrato fija el orden: del cobro más
 * manual al más automático (efectivo, transferencia, Mercado Pago). El escalón
 * de la rampa dice cuánto trámite le saca al club, y por eso no se ordena de
 * mayor a menor, que sería pintar dos veces el mismo dato.
 *
 * Son los mismos tres escalones que los conceptos de "Ingresos por mes": el
 * club tiene una sola familia cromática. La leyenda de cada tarjeta es la que
 * dice qué es cada color.
 */
const COLORS = [
    { fill: 'fill-chart-ramp-1', swatch: 'bg-chart-ramp-1' },
    { fill: 'fill-chart-ramp-2', swatch: 'bg-chart-ramp-2' },
    { fill: 'fill-chart-ramp-3', swatch: 'bg-chart-ramp-3' },
]

const SIZE = 236
const OUTER = 100
const INNER = 62
/** Los 2 px de aire entre tramos, pasados a radianes sobre el radio medio. */
const GAP_ANGLE = 2 / ((OUTER + INNER) / 2)

/**
 * Por dónde entró la plata: la dona.
 *
 * **Decisión pendiente.** La maqueta dejó abierta la dona contra las barras
 * rotuladas, y nadie la resolvió; va la dona porque es la que se pidió
 * originalmente. Es legítima acá —tres partes que suman el total—, pero las
 * barras dejarían leer los importes sin pasar el mouse.
 *
 * Suma el TOTAL de cada pago y no sus líneas, al revés que los ingresos: la
 * pregunta es cuánta plata trajo cada medio, y el importe ajustado en el
 * mostrador es plata que entró en efectivo.
 */
export const PaymentMethodsCard = ({ query, months }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="Por dónde entró la plata"
            query={query}
            description={(data) => {
                const summary = paymentMethodsSummary(data)

                if (summary.total <= 0) return `Todavía no hay pagos aprobados en los últimos ${months} meses.`

                return `Pagos aprobados de los últimos ${months} meses, por el total cobrado. ${percentLabel(summary.portalShare)} entró por el portal, sin pasar por la sede.`
            }}
            chart={(data) => {
                const summary = paymentMethodsSummary(data)
                const center = SIZE / 2
                const segments = donutSegments(
                    summary.rows.map((row) => row.amount),
                    GAP_ANGLE,
                )
                const hovered = hover ? summary.rows[hover.index] : undefined

                return (
                    <>
                        <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                            <svg
                                viewBox={`0 0 ${SIZE} ${SIZE}`}
                                role="img"
                                aria-label="Reparto de lo cobrado por medio de pago"
                                // La dona no se estira: su viewBox es cuadrado y sin tope
                                // ocuparía todo el ancho de la tarjeta.
                                className="mx-auto block h-auto w-full max-w-[14rem]"
                            >
                                {/* Sin plata, el anillo vacío en gris: un hueco en blanco
                                    parece un gráfico que no cargó. */}
                                {segments.length === 0 && (
                                    <path
                                        d={ringSegmentPath(center, center, OUTER, INNER, 0, Math.PI * 2)}
                                        className="fill-muted"
                                    />
                                )}

                                {segments.map((segment) => (
                                    <path
                                        key={segment.index}
                                        d={ringSegmentPath(
                                            center,
                                            center,
                                            OUTER,
                                            INNER,
                                            segment.drawStartAngle,
                                            segment.drawEndAngle,
                                        )}
                                        className={COLORS[segment.index]?.fill}
                                    />
                                ))}

                                <text
                                    x={center}
                                    y={center + 2}
                                    textAnchor="middle"
                                    className="fill-ink text-[19px] font-bold tabular-nums"
                                >
                                    {compactMoney(summary.total)}
                                </text>
                                <text
                                    x={center}
                                    y={center + 20}
                                    textAnchor="middle"
                                    className="fill-muted-foreground text-[10.5px]"
                                >
                                    {`${months} meses`}
                                </text>

                                {/* El área de hover es el tramo entero, sin el aire: ya
                                    es grande de sobra. */}
                                {segments.map((segment) => (
                                    <path
                                        key={segment.index}
                                        d={ringSegmentPath(
                                            center,
                                            center,
                                            OUTER,
                                            INNER,
                                            segment.startAngle,
                                            segment.endAngle,
                                        )}
                                        className="fill-transparent hover:fill-muted-foreground/10"
                                        onPointerMove={(event) =>
                                            setHover({
                                                index: segment.index,
                                                x: event.clientX,
                                                y: event.clientY,
                                            })
                                        }
                                        onPointerLeave={() => setHover(null)}
                                    />
                                ))}
                            </svg>

                            {/* La leyenda de la dona: con tres series, el color solo
                                no alcanza para decir qué tramo es cuál. */}
                            <ul className="flex flex-col gap-3">
                                {summary.rows.map((row, index) => (
                                    <li key={row.method} className="flex items-center gap-2.5 text-sm">
                                        <span
                                            className={cn('size-2.5 shrink-0 rounded-[3px]', COLORS[index]?.swatch)}
                                        />
                                        <span className="text-muted-foreground">{row.label}</span>
                                        <span className="ml-auto font-semibold whitespace-nowrap text-ink tabular-nums">
                                            {percentLabel(row.share)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {hover && hovered && (
                            <StatsTooltip point={hover} title={hovered.label}>
                                <TooltipLine label="Cobrado" value={formatMoney(hovered.amount)} />
                                <TooltipLine label="Pagos" value={hovered.payments} />
                                <TooltipLine label="Del total" value={percentLabel(hovered.share)} total />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = paymentMethodsSummary(data)

                return (
                    <StatsTable
                        columns={['Medio', 'Pagos', 'Cobrado', 'Del total']}
                        rows={summary.rows.map((row) => ({
                            key: row.method,
                            cells: [row.label, row.payments, formatMoney(row.amount), percentLabel(row.share)],
                        }))}
                        footer={[
                            'Total',
                            summary.payments,
                            formatMoney(summary.total),
                            summary.total > 0 ? '100%' : '0%',
                        ]}
                    />
                )
            }}
        />
    )
}
