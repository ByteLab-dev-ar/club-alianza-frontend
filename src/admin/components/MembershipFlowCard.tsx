import { useState } from 'react'

import { axisTicks, columnDownPath, columnUpPath, niceScale } from '../lib/chart-geometry'
import { membershipFlowSummary, monthLabel, monthTickLabel, signed } from '../lib/dashboard-stats'
import type { MembershipFlowStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: MembershipFlowStats | undefined; isLoading: boolean; isError: boolean }
    months: number
}

const W = 940
const H = 300
const LEFT = 56
const RIGHT = 16
const TOP = 22
/*
 * Más alto que el de ingresos: abajo del cero cuelgan las bajas, y el rótulo
 * "-1" del mes en curso cae debajo de su columna. Con el margen de 34 y la
 * columna tocando el piso, ese rótulo se pisaba con el nombre del mes.
 */
const BOTTOM = 52
const THICKNESS = 24

const joinedText = (count: number) => (count === 1 ? 'entró 1 socio' : `entraron ${count} socios`)
const leftText = (count: number) => (count === 1 ? 'se fue 1' : `se fueron ${count}`)
const netText = (net: number) =>
    net > 0 ? `El padrón creció ${net}.` : net < 0 ? `El padrón bajó ${-net}.` : 'El padrón quedó igual.'

/**
 * Altas arriba del cero y bajas abajo, mes a mes.
 *
 * Cada lado tiene su propio techo redondo, pero los dos comparten la MISMA
 * escala de píxeles por socio: con escalas distintas, dos bajas se verían tan
 * altas como diez altas y el gráfico diría que el club se vacía.
 *
 * Lo que el gráfico hereda del contrato y conviene saber al leerlo: un alta es
 * la antigüedad cargada (`memberSince`) y una baja el archivado; si a alguien
 * se lo reintegra, su baja desaparece del mes en que se fue.
 */
export const MembershipFlowCard = ({ query, months }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="Altas y bajas por mes"
            query={query}
            legend={[
                { label: 'Altas', swatchClassName: 'bg-chart-joined' },
                { label: 'Bajas', swatchClassName: 'bg-chart-left' },
            ]}
            description={(data) => {
                const summary = membershipFlowSummary(data)
                return `En los últimos ${months} meses ${joinedText(summary.joined)} y ${leftText(summary.left)}. ${netText(summary.net)}`
            }}
            chart={(data) => {
                const summary = membershipFlowSummary(data)
                const plotWidth = W - LEFT - RIGHT
                const plotHeight = H - TOP - BOTTOM
                const band = plotWidth / Math.max(summary.rows.length, 1)

                const up = niceScale(summary.maxJoined, { integer: true })
                const down = niceScale(summary.maxLeft, { integer: true })
                const range = up.top + down.top
                const zero = TOP + (up.top / range) * plotHeight
                const toHeight = (value: number) => (value / range) * plotHeight

                const lastIndex = summary.rows.length - 1
                const last = summary.rows[lastIndex]
                const lastX = LEFT + band * lastIndex + band / 2
                const hovered = hover ? summary.rows[hover.index] : undefined

                // El cero lo dibuja aparte la línea base: acá van los renglones
                // de cada lado, sin repetirlo.
                const gridLines = [
                    ...axisTicks(up, summary.maxJoined)
                        .slice(1)
                        .map((tick) => ({ key: `up-${tick}`, tick, y: zero - toHeight(tick) })),
                    ...axisTicks(down, summary.maxLeft)
                        .slice(1)
                        .map((tick) => ({ key: `down-${tick}`, tick, y: zero + toHeight(tick) })),
                ]

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${H}`}
                            role="img"
                            aria-label="Altas y bajas de socios por mes"
                            className="block h-auto w-full min-w-[40rem] overflow-visible"
                        >
                            {gridLines.map((line) => (
                                <g key={line.key}>
                                    <line
                                        x1={LEFT}
                                        x2={W - RIGHT}
                                        y1={line.y}
                                        y2={line.y}
                                        className="stroke-chart-grid"
                                    />
                                    <text
                                        x={LEFT - 10}
                                        y={line.y + 4}
                                        textAnchor="end"
                                        className="fill-muted-foreground text-[11px] tabular-nums"
                                    >
                                        {line.tick}
                                    </text>
                                </g>
                            ))}

                            {summary.rows.map((row, index) => {
                                const x = LEFT + band * index + (band - THICKNESS) / 2

                                return (
                                    <g key={row.month}>
                                        {row.joined > 0 && (
                                            <path
                                                d={columnUpPath(
                                                    x,
                                                    zero - 1 - (toHeight(row.joined) - 1),
                                                    THICKNESS,
                                                    toHeight(row.joined) - 1,
                                                    4,
                                                )}
                                                className="fill-chart-joined"
                                            />
                                        )}
                                        {row.left > 0 && (
                                            <path
                                                d={columnDownPath(x, zero + 1, THICKNESS, toHeight(row.left) - 1, 4)}
                                                className="fill-chart-left"
                                            />
                                        )}
                                        <text
                                            x={LEFT + band * index + band / 2}
                                            y={H - BOTTOM + 40}
                                            textAnchor="middle"
                                            className="fill-muted-foreground text-[11px]"
                                        >
                                            {monthTickLabel(row.month)}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* La línea del cero ordena el gráfico: va más marcada que la
                                grilla y encima de las columnas, para que ninguna la tape. */}
                            <line x1={LEFT} x2={W - RIGHT} y1={zero} y2={zero} className="stroke-border" />
                            <text
                                x={LEFT - 10}
                                y={zero + 4}
                                textAnchor="end"
                                className="fill-muted-foreground text-[11px] tabular-nums"
                            >
                                0
                            </text>

                            {/* Un solo rótulo directo: el mes en curso, arriba y abajo. */}
                            {last && last.joined > 0 && (
                                <text
                                    x={lastX}
                                    y={zero - toHeight(last.joined) - 9}
                                    textAnchor="middle"
                                    className="fill-ink text-xs font-semibold tabular-nums"
                                >
                                    {signed(last.joined)}
                                </text>
                            )}
                            {last && last.left > 0 && (
                                <text
                                    x={lastX}
                                    y={zero + toHeight(last.left) + 17}
                                    textAnchor="middle"
                                    className="fill-ink text-xs font-semibold tabular-nums"
                                >
                                    {signed(-last.left)}
                                </text>
                            )}

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
                                <TooltipLine label="Altas" value={hovered.joined} swatchClassName="bg-chart-joined" />
                                <TooltipLine label="Bajas" value={hovered.left} swatchClassName="bg-chart-left" />
                                <TooltipLine label="Neto" value={signed(hovered.net)} total />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = membershipFlowSummary(data)

                return (
                    <StatsTable
                        columns={['Mes', 'Altas', 'Bajas', 'Neto']}
                        rows={summary.rows.map((row) => ({
                            key: row.month,
                            cells: [monthLabel(row.month), row.joined, row.left, signed(row.net)],
                        }))}
                        footer={['Total', summary.joined, summary.left, signed(summary.net)]}
                    />
                )
            }}
        />
    )
}
