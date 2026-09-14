import { useState } from 'react'

import { barRightPath } from '../lib/chart-geometry'
import { countLabel, rosterSummary } from '../lib/dashboard-stats'
import type { RosterByCategoryStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: RosterByCategoryStats | undefined; isLoading: boolean; isError: boolean }
}

const W = 560
const ROW = 34
const LEFT = 96
const RIGHT = 40
const TOP = 6
const THICKNESS = 20
const GAP = 2

/**
 * Jugadores por categoría, partidos en quién tiene la actividad al día.
 *
 * Las nueve categorías se dibujan siempre, también las vacías: una categoría
 * sin nadie ES el dato —no hay plantel para armarla—, y esconderla sería
 * esconder justo lo que hay que resolver.
 *
 * Los que no tienen categoría posible (sin fecha de nacimiento o por debajo de
 * la edad para jugar) no entran en ninguna barra y van como número en la
 * bajada: sin eso, el gráfico se los comería en silencio.
 */
export const RosterCard = ({ query }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="Plantel por categoría"
            query={query}
            legend={[
                { label: 'Actividad al día', swatchClassName: 'bg-chart-paid' },
                { label: 'Sin pagar', swatchClassName: 'bg-chart-unpaid' },
            ]}
            description={(data) => {
                const summary = rosterSummary(data)

                return (
                    `${countLabel(summary.players, 'jugador', 'jugadores')} con categoría, ${summary.upToDate} con la actividad al día.` +
                    (summary.emptyCategories > 0
                        ? ` ${countLabel(summary.emptyCategories, 'categoría', 'categorías')} sin nadie.`
                        : '') +
                    (summary.withoutCategory > 0
                        ? ` ${countLabel(summary.withoutCategory, 'jugador', 'jugadores')} sin categoría: sin fecha de nacimiento o por debajo de la edad para jugar.`
                        : '')
                )
            }}
            chart={(data) => {
                const summary = rosterSummary(data)
                const plotWidth = W - LEFT - RIGHT
                const height = TOP + ROW * summary.rows.length + 6
                const max = Math.max(summary.max, 1)
                const hovered = hover ? summary.rows[hover.index] : undefined

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${height}`}
                            role="img"
                            aria-label="Jugadores por categoría, con y sin la actividad al día"
                            className="block h-auto w-full min-w-[26rem] overflow-visible"
                        >
                            {summary.rows.map((row, index) => {
                                const y = TOP + ROW * index + (ROW - THICKNESS) / 2
                                const middle = y + THICKNESS / 2 + 4
                                const totalWidth = (row.players / max) * plotWidth
                                const paidWidth = (row.activityUpToDate / max) * plotWidth
                                const unpaidWidth = totalWidth - paidWidth
                                const paidText = String(row.activityUpToDate)

                                return (
                                    <g key={row.category}>
                                        <text
                                            x={LEFT - 12}
                                            y={middle}
                                            textAnchor="end"
                                            className="fill-foreground text-xs font-medium"
                                        >
                                            {row.label}
                                        </text>

                                        {row.players === 0 ? (
                                            // Una categoría vacía no es un renglón en blanco: es el dato.
                                            <text x={LEFT} y={middle} className="fill-muted-foreground text-[11px]">
                                                sin jugadores
                                            </text>
                                        ) : (
                                            <>
                                                {unpaidWidth > 0 && (
                                                    <path
                                                        d={barRightPath(
                                                            LEFT + paidWidth + (paidWidth > 0 ? GAP : 0),
                                                            y,
                                                            Math.max(unpaidWidth - (paidWidth > 0 ? GAP : 0), 0),
                                                            THICKNESS,
                                                            4,
                                                        )}
                                                        className="fill-chart-unpaid"
                                                    />
                                                )}
                                                {paidWidth > 0 && (
                                                    <path
                                                        d={
                                                            unpaidWidth > 0
                                                                ? `M${LEFT},${y} h${paidWidth} v${THICKNESS} h-${paidWidth} Z`
                                                                : barRightPath(LEFT, y, paidWidth, THICKNESS, 4)
                                                        }
                                                        className="fill-chart-paid"
                                                    />
                                                )}
                                                <text
                                                    x={LEFT + totalWidth + 10}
                                                    y={middle}
                                                    className="fill-ink text-xs font-semibold tabular-nums"
                                                >
                                                    {row.players}
                                                </text>
                                                {/* El número va ADENTRO del tramo solo si entra con
                                                    aire a los dos lados; si no, lo cuentan el
                                                    tooltip y la tabla. Va en el color de la
                                                    tarjeta, que contrasta con el tramo en los dos
                                                    temas: el blanco fijo se perdía sobre el celeste
                                                    claro del modo oscuro. */}
                                                {paidWidth >= paidText.length * 8 + 16 && (
                                                    <text
                                                        x={LEFT + paidWidth / 2}
                                                        y={middle}
                                                        textAnchor="middle"
                                                        className="fill-card text-[11px] font-semibold tabular-nums"
                                                    >
                                                        {paidText}
                                                    </text>
                                                )}
                                            </>
                                        )}

                                        <rect
                                            x={LEFT - 4}
                                            y={TOP + ROW * index}
                                            width={plotWidth + RIGHT}
                                            height={ROW}
                                            className="fill-transparent hover:fill-muted-foreground/10"
                                            onPointerMove={(event) =>
                                                setHover({ index, x: event.clientX, y: event.clientY })
                                            }
                                            onPointerLeave={() => setHover(null)}
                                        />
                                    </g>
                                )
                            })}
                        </svg>

                        {hover && hovered && (
                            <StatsTooltip point={hover} title={hovered.label}>
                                <TooltipLine
                                    label="Actividad al día"
                                    value={hovered.activityUpToDate}
                                    swatchClassName="bg-chart-paid"
                                />
                                <TooltipLine
                                    label="Sin pagar"
                                    value={hovered.notUpToDate}
                                    swatchClassName="bg-chart-unpaid"
                                />
                                <TooltipLine label="Jugadores" value={hovered.players} total />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = rosterSummary(data)

                return (
                    <StatsTable
                        columns={['Categoría', 'Al día', 'Sin pagar', 'Jugadores']}
                        rows={[
                            ...summary.rows.map((row) => ({
                                key: row.category,
                                cells: [row.label, row.activityUpToDate, row.notUpToDate, row.players],
                            })),
                            // Sin categoría no hay reparto por actividad que mostrar:
                            // el endpoint trae solo cuántos son.
                            {
                                key: 'sin-categoria',
                                cells: ['Sin categoría', '—', '—', summary.withoutCategory],
                            },
                        ]}
                        footer={[
                            'Total',
                            summary.upToDate,
                            summary.notUpToDate,
                            summary.total,
                        ]}
                    />
                )
            }}
        />
    )
}
