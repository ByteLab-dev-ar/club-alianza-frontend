import { useState } from 'react'

import { barLeftPath, barRightPath } from '../lib/chart-geometry'
import { countLabel, pyramidSummary } from '../lib/dashboard-stats'
import type { AgePyramidStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: AgePyramidStats | undefined; isLoading: boolean; isError: boolean }
}

const W = 460
const ROW = 26
const TOP = 30
const BOTTOM = 8
const CENTER = W / 2
/** El pasillo del medio, donde van los rótulos de las bandas. */
const GUTTER = 92
/** Lo que queda afuera de cada barra para el número de la punta. */
const MARGIN = 34
const THICKNESS = 18

/**
 * Socios por banda de edad, mujeres a la izquierda y varones a la derecha.
 *
 * Los dos lados no se distinguen por color sino por POSICIÓN, con los dos
 * encabezados escritos arriba. Dos colores obligarían a un segundo tono fuera
 * de la familia del club, y pintar un sexo con el acento y el otro en gris
 * diría que uno es el principal.
 *
 * Lo que una pirámide de dos lados no puede dibujar va como número en la
 * bajada, y cada cosa por su nombre: la X del DNI es un valor declarado, no un
 * dato que falta, así que no se suma a "sin dato".
 */
export const AgePyramidCard = ({ query }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="Pirámide de edades"
            query={query}
            description={(data) => {
                const summary = pyramidSummary(data)

                // Los que no entran van en una sola oración, por motivo: el sexo X
                // (una pirámide de dos lados no lo dibuja) y los datos que faltan.
                const outside = [
                    summary.sexX > 0 ? `${summary.sexX} con sexo X` : '',
                    summary.unknownSex > 0 ? `${summary.unknownSex} sin sexo cargado` : '',
                    summary.unknownBornDate > 0 ? `${summary.unknownBornDate} sin nacimiento` : '',
                ].filter(Boolean)

                return (
                    `${countLabel(summary.female + summary.male, 'socio', 'socios')}.` +
                    (outside.length > 0 ? ` Afuera: ${outside.join(', ')}.` : '')
                )
            }}
            chart={(data) => {
                const summary = pyramidSummary(data)
                const height = TOP + ROW * summary.rows.length + BOTTOM
                const leftEdge = CENTER - GUTTER / 2
                const rightEdge = CENTER + GUTTER / 2
                const plot = leftEdge - MARGIN
                const max = Math.max(summary.max, 1)
                const hovered = hover ? summary.rows[hover.index] : undefined

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${height}`}
                            role="img"
                            aria-label="Socios por banda de edad, mujeres a la izquierda y varones a la derecha"
                            className="block h-auto w-full max-w-[460px] min-w-[26rem] overflow-visible"
                        >
                            <text
                                x={leftEdge}
                                y={14}
                                textAnchor="end"
                                className="fill-muted-foreground text-[11px] font-bold tracking-widest uppercase"
                            >
                                Mujeres
                            </text>
                            <text
                                x={rightEdge}
                                y={14}
                                className="fill-muted-foreground text-[11px] font-bold tracking-widest uppercase"
                            >
                                Varones
                            </text>

                            {summary.rows.map((row, index) => {
                                const y = TOP + ROW * index + (ROW - THICKNESS) / 2
                                const middle = y + THICKNESS / 2 + 4
                                const femaleWidth = (row.female / max) * plot
                                const maleWidth = (row.male / max) * plot

                                return (
                                    <g key={row.band}>
                                        {row.female > 0 && (
                                            <path
                                                d={barLeftPath(leftEdge - femaleWidth, y, femaleWidth, THICKNESS, 4)}
                                                className="fill-chart-single"
                                            />
                                        )}
                                        {row.male > 0 && (
                                            <path
                                                d={barRightPath(rightEdge, y, maleWidth, THICKNESS, 4)}
                                                className="fill-chart-single"
                                            />
                                        )}
                                        <text
                                            x={leftEdge - femaleWidth - 8}
                                            y={middle}
                                            textAnchor="end"
                                            className={
                                                row.female > 0
                                                    ? 'fill-ink text-xs font-semibold tabular-nums'
                                                    : 'fill-muted-foreground text-[11px] tabular-nums'
                                            }
                                        >
                                            {row.female}
                                        </text>
                                        <text
                                            x={rightEdge + maleWidth + 8}
                                            y={middle}
                                            className={
                                                row.male > 0
                                                    ? 'fill-ink text-xs font-semibold tabular-nums'
                                                    : 'fill-muted-foreground text-[11px] tabular-nums'
                                            }
                                        >
                                            {row.male}
                                        </text>
                                        <text
                                            x={CENTER}
                                            y={middle}
                                            textAnchor="middle"
                                            className="fill-foreground text-xs font-medium"
                                        >
                                            {row.label}
                                        </text>
                                        <rect
                                            x={0}
                                            y={TOP + ROW * index}
                                            width={W}
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
                            <StatsTooltip point={hover} title={`${hovered.label} años`}>
                                <TooltipLine label="Mujeres" value={hovered.female} />
                                <TooltipLine label="Varones" value={hovered.male} />
                                <TooltipLine label="Socios" value={hovered.total} total />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = pyramidSummary(data)

                return (
                    <StatsTable
                        columns={['Edad', 'Mujeres', 'Varones', 'Socios']}
                        rows={[
                            ...summary.rows.map((row) => ({
                                key: row.band,
                                cells: [row.label, row.female, row.male, row.total],
                            })),
                            { key: 'x', cells: ['Sexo X', '', '', summary.sexX] },
                            { key: 'sin-sexo', cells: ['Sin el sexo cargado', '', '', summary.unknownSex] },
                            {
                                key: 'sin-fecha',
                                cells: ['Sin fecha de nacimiento', '', '', summary.unknownBornDate],
                            },
                        ]}
                        footer={['Total', summary.female, summary.male, summary.total]}
                    />
                )
            }}
        />
    )
}
