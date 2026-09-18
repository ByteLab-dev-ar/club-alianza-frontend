import { useState } from 'react'

import { formatMoney } from '@/lib/format'
import { barRightPath } from '../lib/chart-geometry'
import { channelLabel, paymentChannelsLine, paymentChannelsSummary, type PaymentChannel } from '../lib/dashboard-stats'
import type { PaymentMethodsStats } from '../interfaces/AdminStats'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: PaymentMethodsStats | undefined; isLoading: boolean; isError: boolean }
    months: number
}

/**
 * Los colores van por CANAL y no por medio: una serie contra el resto.
 *
 * **El portal en `--chart-single` y la sede en el gris de `--chart-unpaid`, y
 * nunca la rampa.** Hasta el 17/09/2026 este gráfico era una dona con los tres
 * escalones de `--chart-ramp-*`, los mismos que los conceptos de "Ingresos por
 * mes": dos gráficos de plata con la misma leyenda de colores y otras palabras
 * —el más oscuro era Membresía en uno y Efectivo en el otro—, y salió por eso.
 * Lo que este gráfico compara no son tres medios, es lo que el socio paga solo
 * contra lo que se cobra en la sede: un color de acento para la serie que
 * importa y gris para el resto, que es la forma de "una serie contra el resto"
 * (dataviz: énfasis, un tono y gris).
 *
 * `--chart-single` era el token de una serie sola y estaba sin uso desde que
 * salió la pirámide. El gris es el único gris de datos del sistema, y en esta
 * pantalla dice siempre "lo otro" contra un celeste que es lo que se busca: sin
 * pagar contra pagado en Plantel, vencida contra vigente en Membresía, y acá el
 * trámite que no se evitó contra el que sí. No hay un token nuevo para un gris
 * que valdría lo mismo.
 *
 * El gris da 2.5:1 contra la tarjeta, bajo el 3:1 de una marca: lo compensan el
 * nombre del medio a la izquierda de cada barra, la cantidad en la punta, la
 * leyenda y la tabla gemela.
 */
const CHANNEL_COLORS: Record<PaymentChannel, { fill: string; swatch: string }> = {
    portal: { fill: 'fill-chart-single', swatch: 'bg-chart-single' },
    sede: { fill: 'fill-chart-unpaid', swatch: 'bg-chart-unpaid' },
}

const CHANNELS: PaymentChannel[] = ['portal', 'sede']

const W = 460
/** El renglón de los encabezados, "Pagos" y "Cobrado", arriba de las barras. */
const HEAD = 18
const ROW = 32
const THICKNESS = 24
/** El aire de más entre el bloque del portal y la sede: los agrupa sin una línea. */
const GROUP_GAP = 10
const LEFT = 108
/** La columna de lo cobrado, alineada a la derecha: "$ 12.345.678" en 12px. */
const AMOUNT = 96
/** Lo que queda después de la barra más larga para su cantidad. */
const TIP = 44

/**
 * Por dónde entra la plata: una barra por medio de pago, del largo de la
 * CANTIDAD de pagos, pintada por canal.
 *
 * Vuelve el 18/09/2026, con otra forma. La dona (`PaymentMethodsCard` hasta el
 * commit 6279dd3) repartía pesos en tres colores; esto cuenta pagos, que es lo
 * que mide el éxito del producto —cada pago hecho desde el teléfono es una
 * persona que no fue a la sede (PRODUCT.md)—, y el porcentaje del portal, que es
 * esa vara, va en el pie en palabras.
 *
 * **Barras y no dona**, que era la decisión que la maqueta había dejado abierta:
 * las barras dejan leer la cantidad y el importe de cada medio sin pasar el
 * mouse.
 *
 * **El importe va como texto y no como una segunda barra.** Pagos y pesos son
 * dos medidas en dos escalas, y dos escalas en un mismo gráfico se leen como una
 * sola: un medio con pocos pagos grandes parecería el más usado. La barra es la
 * de los pagos; lo cobrado, que es el TOTAL de cada pago y no sus líneas, va en
 * su columna a la derecha, para conciliar.
 */
export const PaymentMethodsCard = ({ query, months }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    return (
        <StatsCard
            title="Por dónde entra la plata"
            query={query}
            legend={CHANNELS.map((channel) => ({
                label: channelLabel(channel),
                swatchClassName: CHANNEL_COLORS[channel].swatch,
            }))}
            description={(data) => paymentChannelsLine(paymentChannelsSummary(data), months)}
            chart={(data) => {
                const summary = paymentChannelsSummary(data)
                const plotWidth = W - LEFT - AMOUNT - TIP
                const max = Math.max(summary.maxPayments, 1)
                const hovered = hover ? summary.rows[hover.index] : undefined

                // El aire del grupo se suma a partir de la primera fila de la sede.
                const firstSede = summary.rows.findIndex((row) => row.channel === 'sede')
                const rowTop = (index: number) =>
                    HEAD + ROW * index + (firstSede > 0 && index >= firstSede ? GROUP_GAP : 0)
                const height = rowTop(summary.rows.length) + 4

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${height}`}
                            role="img"
                            aria-label="Pagos aprobados por medio de pago, por el portal y en la sede"
                            className="block h-auto w-full max-w-[460px] min-w-[26rem] overflow-visible"
                        >
                            {/* Qué mide cada cosa: sin esto, la barra y el importe
                                de al lado se leen como la misma cifra. */}
                            <text x={LEFT} y={11} className="fill-muted-foreground text-[11px]">
                                Pagos
                            </text>
                            <text x={W} y={11} textAnchor="end" className="fill-muted-foreground text-[11px]">
                                Cobrado
                            </text>

                            {summary.rows.map((row, index) => {
                                const y = rowTop(index) + (ROW - THICKNESS) / 2
                                const middle = y + THICKNESS / 2 + 4
                                const width = (row.payments / max) * plotWidth

                                return (
                                    <g key={row.method}>
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
                                                className={CHANNEL_COLORS[row.channel].fill}
                                            />
                                        )}
                                        {/* También en cero: un medio que nadie usó es el dato. */}
                                        <text
                                            x={LEFT + width + 10}
                                            y={middle}
                                            className="fill-ink text-xs font-semibold tabular-nums"
                                        >
                                            {row.payments}
                                        </text>
                                        <text
                                            x={W}
                                            y={middle}
                                            textAnchor="end"
                                            className="fill-foreground text-xs tabular-nums"
                                        >
                                            {formatMoney(row.amount)}
                                        </text>
                                        <rect
                                            x={LEFT - 4}
                                            y={rowTop(index)}
                                            width={W - LEFT + 4}
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
                                    label="Canal"
                                    value={channelLabel(hovered.channel)}
                                    swatchClassName={CHANNEL_COLORS[hovered.channel].swatch}
                                />
                                <TooltipLine label="Pagos" value={hovered.payments} />
                                <TooltipLine label="Cobrado" value={formatMoney(hovered.amount)} />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = paymentChannelsSummary(data)

                return (
                    <StatsTable
                        columns={['Medio', 'Pagos', 'Cobrado']}
                        rows={summary.rows.map((row) => ({
                            key: row.method,
                            // El canal al lado del nombre y no en su columna: la
                            // tabla alinea a la derecha todo lo que no es la
                            // primera columna, que es para cifras.
                            cells: [
                                <>
                                    {row.label}{' '}
                                    <span className="text-muted-foreground">
                                        · {channelLabel(row.channel).toLowerCase()}
                                    </span>
                                </>,
                                row.payments,
                                formatMoney(row.amount),
                            ],
                        }))}
                        footer={['Total', summary.payments, formatMoney(summary.amount)]}
                    />
                )
            }}
        />
    )
}
