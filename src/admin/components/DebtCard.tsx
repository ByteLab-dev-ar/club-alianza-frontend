import { useState } from 'react'

import { barRightPath } from '../lib/chart-geometry'
import { countLabel, debtSummary } from '../lib/dashboard-stats'
import type { DebtStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: DebtStats | undefined; isLoading: boolean; isError: boolean }
}

/**
 * Del atraso más corto al más largo, del rojo más claro al más oscuro. Por
 * posición y no por nombre: el contrato garantiza los cuatro tramos en ese
 * orden.
 */
const FILLS = ['fill-chart-debt-1', 'fill-chart-debt-2', 'fill-chart-debt-3', 'fill-chart-debt-4']

const W = 560
const ROW = 42
const LEFT = 116
const RIGHT = 52
const TOP = 8
const THICKNESS = 24

/** "5 ya pasaron", "1 ya pasó". */
const pastThresholdText = (count: number) =>
    count === 1 ? '1 ya pasó los tres meses' : `${count} ya pasaron los tres meses`

/**
 * Los socios con la membresía vencida, por antigüedad del atraso.
 *
 * Todavía sin el MONTO de la deuda: el endpoint trae solo la cantidad de socios
 * por tramo, y calcular cuánto deben es otro endpoint (meses vencidos por cuota
 * vigente, con el descuento familiar en el medio). La maqueta lo dibujaba con
 * datos de mentira; acá no se dibuja hasta que exista.
 */
export const DebtCard = ({ query }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="La deuda, por antigüedad"
            query={query}
            description={(data) => {
                const summary = debtSummary(data)
                const noDate =
                    summary.noExpirationDate === 0
                        ? ''
                        : ` ${countLabel(summary.noExpirationDate, 'socio más no tiene', 'socios más no tienen')} vencimiento cargado: deben, pero no se sabe desde cuándo.`

                if (summary.inBuckets === 0) {
                    return summary.noExpirationDate === 0
                        ? 'Nadie tiene la membresía vencida.'
                        : `Nadie con vencimiento cargado está atrasado. ${countLabel(summary.noExpirationDate, 'socio no tiene', 'socios no tienen')} vencimiento: deben, pero no se sabe desde cuándo.`
                }

                /*
                 * "Pasaron los tres meses" y no "están marcados morosos": los dos
                 * tramos largos son los que cumplen el CRITERIO de la marca, pero
                 * la marca deja afuera al personal y corre de noche con un tope
                 * diario. Decir "marcados" sería prometer un número que no es.
                 */
                return (
                    `${countLabel(summary.inBuckets, 'socio', 'socios')} con la membresía vencida` +
                    (summary.pastThreshold > 0
                        ? `; ${pastThresholdText(summary.pastThreshold)}, que es el criterio para marcar moroso.`
                        : '.') +
                    noDate
                )
            }}
            chart={(data) => {
                const summary = debtSummary(data)
                const plotWidth = W - LEFT - RIGHT
                const height = TOP + ROW * summary.rows.length + 8
                const max = Math.max(summary.max, 1)
                const hovered = hover ? summary.rows[hover.index] : undefined

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${height}`}
                            role="img"
                            aria-label="Socios con la membresía vencida, por antigüedad del atraso"
                            className="block h-auto w-full min-w-[26rem] overflow-visible"
                        >
                            {summary.rows.map((row, index) => {
                                const y = TOP + ROW * index + (ROW - THICKNESS) / 2
                                const width = (row.members / max) * plotWidth
                                const middle = y + THICKNESS / 2 + 4

                                return (
                                    <g key={row.bucket}>
                                        <text
                                            x={LEFT - 14}
                                            y={middle}
                                            textAnchor="end"
                                            className="fill-foreground text-xs font-medium"
                                        >
                                            {row.label}
                                        </text>
                                        {width > 0 && (
                                            <path
                                                d={barRightPath(LEFT, y, width, THICKNESS, 4)}
                                                className={FILLS[index]}
                                            />
                                        )}
                                        <text
                                            x={LEFT + width + 10}
                                            y={middle}
                                            className="fill-ink text-xs font-semibold tabular-nums"
                                        >
                                            {row.members}
                                        </text>
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
                                <TooltipLine label="Socios" value={hovered.members} />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = debtSummary(data)

                return (
                    <StatsTable
                        columns={['Antigüedad', 'Socios']}
                        rows={[
                            ...summary.rows.map((row) => ({ key: row.bucket, cells: [row.label, row.members] })),
                            {
                                key: 'sin-vencimiento',
                                cells: ['Sin vencimiento cargado', summary.noExpirationDate],
                            },
                        ]}
                        footer={['Total', summary.total]}
                    />
                )
            }}
        />
    )
}
