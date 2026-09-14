import { useState } from 'react'

import { formatMoney } from '@/lib/format'
import { axisTicks, columnUpPath, compactAxisValue, niceScale } from '../lib/chart-geometry'
import { incomeSummary, monthLabel, monthTickLabel } from '../lib/dashboard-stats'
import type { IncomeStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: IncomeStats | undefined; isLoading: boolean; isError: boolean }
    months: number
}

/** Los tres conceptos, del escalón más oscuro de la rampa al más claro. */
const CONCEPTS = [
    { key: 'membership', label: 'Membresía', fill: 'fill-chart-ramp-1', swatch: 'bg-chart-ramp-1' },
    { key: 'activity', label: 'Actividad', fill: 'fill-chart-ramp-2', swatch: 'bg-chart-ramp-2' },
    { key: 'insurance', label: 'Seguro', fill: 'fill-chart-ramp-3', swatch: 'bg-chart-ramp-3' },
] as const

const W = 940
const H = 300
const LEFT = 56
const RIGHT = 16
const TOP = 26
const BOTTOM = 34
/** Ninguna marca pasa de 24: el resto de la banda del mes es aire. */
const THICKNESS = 24
/** El aire entre dos tramos apilados, del color de la tarjeta. */
const GAP = 2

/**
 * Ingresos por concepto, mes a mes: columnas apiladas.
 *
 * **Puede no sumar lo mismo que la tarjeta "Ingresos del mes", y está decidido
 * así.** El gráfico suma lo calculado de cada concepto (las líneas del pago) y
 * la tarjeta suma lo cobrado: difieren cuando el mostrador cobró un importe
 * distinto del calculado. La diferencia no es de ningún concepto, así que acá
 * no se reparte ni se completa.
 */
export const IncomeCard = ({ query, months }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="Ingresos por mes"
            query={query}
            legend={CONCEPTS.map((concept) => ({ label: concept.label, swatchClassName: concept.swatch }))}
            description={(data) =>
                `Pagos aprobados, por concepto y por el mes en que se validaron: ${formatMoney(incomeSummary(data).total)} en los últimos ${months} meses. ` +
                'Suma lo calculado de cada concepto, así que un mes puede no coincidir con lo cobrado si el mostrador ajustó un importe.'
            }
            chart={(data) => {
                const summary = incomeSummary(data)
                const plotWidth = W - LEFT - RIGHT
                const plotHeight = H - TOP - BOTTOM
                const band = plotWidth / Math.max(summary.rows.length, 1)
                const scale = niceScale(summary.max)
                const toY = (value: number) => TOP + plotHeight - (value / scale.top) * plotHeight
                const last = summary.rows.at(-1)
                const hovered = hover ? summary.rows[hover.index] : undefined

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${H}`}
                            role="img"
                            aria-label="Ingresos por mes, apilados por concepto"
                            className="block h-auto w-full min-w-[40rem] overflow-visible"
                        >
                            {/* Grilla: un filete sólido, un paso del fondo. Nunca punteada. */}
                            {axisTicks(scale, summary.max).map((tick) => (
                                <g key={tick}>
                                    <line
                                        x1={LEFT}
                                        x2={W - RIGHT}
                                        y1={toY(tick)}
                                        y2={toY(tick)}
                                        className="stroke-chart-grid"
                                    />
                                    <text
                                        x={LEFT - 10}
                                        y={toY(tick) + 4}
                                        textAnchor="end"
                                        className="fill-muted-foreground text-[11px] tabular-nums"
                                    >
                                        {compactAxisValue(tick)}
                                    </text>
                                </g>
                            ))}

                            {summary.rows.map((row, index) => {
                                const x = LEFT + band * index + (band - THICKNESS) / 2
                                const values = CONCEPTS.map((concept) => row[concept.key])
                                // El tramo de arriba es el último con plata: ese lleva
                                // las esquinas redondeadas, aunque no sea el seguro.
                                const topIndex = values.findLastIndex((value) => value > 0)
                                let stacked = 0

                                return (
                                    <g key={row.month}>
                                        {values.map((value, conceptIndex) => {
                                            if (value <= 0) return null

                                            const top = toY(stacked + value)
                                            const base = toY(stacked)
                                            stacked += value

                                            const isTop = conceptIndex === topIndex
                                            const height = Math.max(base - top - (isTop ? 0 : GAP), 0)
                                            const y = base - height

                                            return (
                                                <path
                                                    key={CONCEPTS[conceptIndex]?.key}
                                                    d={
                                                        isTop
                                                            ? columnUpPath(x, y, THICKNESS, height, 4)
                                                            : `M${x},${y} h${THICKNESS} v${height} h-${THICKNESS} Z`
                                                    }
                                                    className={CONCEPTS[conceptIndex]?.fill}
                                                />
                                            )
                                        })}
                                        <text
                                            x={LEFT + band * index + band / 2}
                                            y={H - BOTTOM + 20}
                                            textAnchor="middle"
                                            className="fill-muted-foreground text-[11px]"
                                        >
                                            {monthTickLabel(row.month)}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Un solo rótulo directo, el del mes en curso. El resto
                                lo cuentan el eje, el tooltip y la tabla. */}
                            {last && (
                                <text
                                    x={LEFT + band * (summary.rows.length - 1) + band / 2}
                                    y={toY(last.total) - 10}
                                    textAnchor="middle"
                                    className="fill-ink text-xs font-semibold tabular-nums"
                                >
                                    {formatMoney(last.total)}
                                </text>
                            )}

                            {/* El hover va sobre la banda entera del mes y no sobre la
                                columna: nunca hay que apuntarle a una marca de 24 px. */}
                            {summary.rows.map((row, index) => (
                                <rect
                                    key={row.month}
                                    x={LEFT + band * index}
                                    y={TOP}
                                    width={band}
                                    height={plotHeight}
                                    className="fill-transparent hover:fill-muted-foreground/10"
                                    onPointerMove={(event) =>
                                        setHover({ index, x: event.clientX, y: event.clientY })
                                    }
                                    onPointerLeave={() => setHover(null)}
                                />
                            ))}
                        </svg>

                        {hover && hovered && (
                            <StatsTooltip point={hover} title={monthLabel(hovered.month)}>
                                {CONCEPTS.map((concept) => (
                                    <TooltipLine
                                        key={concept.key}
                                        label={concept.label}
                                        value={formatMoney(hovered[concept.key])}
                                        swatchClassName={concept.swatch}
                                    />
                                ))}
                                <TooltipLine label="Total" value={formatMoney(hovered.total)} total />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = incomeSummary(data)

                return (
                    <StatsTable
                        columns={['Mes', 'Membresía', 'Actividad', 'Seguro', 'Total']}
                        rows={summary.rows.map((row) => ({
                            key: row.month,
                            cells: [
                                monthLabel(row.month),
                                formatMoney(row.membership),
                                formatMoney(row.activity),
                                formatMoney(row.insurance),
                                formatMoney(row.total),
                            ],
                        }))}
                        footer={[
                            'Total',
                            formatMoney(summary.membership),
                            formatMoney(summary.activity),
                            formatMoney(summary.insurance),
                            formatMoney(summary.total),
                        ]}
                    />
                )
            }}
        />
    )
}
