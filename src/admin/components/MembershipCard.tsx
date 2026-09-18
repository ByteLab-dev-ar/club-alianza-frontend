import { useState } from 'react'

import { membershipBadgeLabel, membershipStatusLabel } from '@/shared/lib/membership-label'
import { barRightPath, splitBar } from '../lib/chart-geometry'
import { membershipLine, membershipSummary, percentText } from '../lib/dashboard-stats'
import type { DashboardSummary } from '../interfaces/DashboardSummary'
import { StatsCard } from './StatsCard'
import { StatsTable } from './StatsTable'
import { StatsTooltip, TooltipLine, type HoverPoint } from './StatsTooltip'

interface Props {
    query: { data: DashboardSummary | undefined; isLoading: boolean; isError: boolean }
    /**
     * Los morosos marcados, de OTRO pedido (`/admin/members/counts`). Solo van
     * al pie, así que cargan y fallan sin tocar la barra.
     */
    delinquent: { data: number | undefined; isError: boolean }
}

const W = 460
/** El renglón de los rótulos, arriba de la barra. */
const LABELS = 16
const TOP = LABELS + 10
const THICKNESS = 28
const H = TOP + THICKNESS + 4
/** El aire entre los dos tramos, del color de la tarjeta, como en los otros gráficos. */
const GAP = 2
/** Un tramo que no es cero se ve aunque sea uno solo (ver `splitBar`). */
const MIN = 3
/** Lo mínimo que mide la zona de hover de cada lado, aunque su tramo mida 3px. */
const HIT_MIN = 56

/**
 * Los dos tramos, en el orden de la barra: de la izquierda a la derecha.
 *
 * `word` va en masculino —"vigentes", "vencidos"— porque cuenta socios y no
 * membresías: son las palabras de las solapas del padrón (`MembersListPage`),
 * donde el mismo número aparece al lado del nombre. La leyenda y la tabla, que
 * nombran la cobertura, van en femenino y salen de `membership-label`, como en
 * el resto del panel.
 */
const PARTS = [
    {
        key: 'active',
        label: membershipStatusLabel(true),
        cell: membershipBadgeLabel(true),
        word: 'vigentes',
        fill: 'fill-chart-paid',
        swatch: 'bg-chart-paid',
    },
    {
        key: 'expired',
        label: membershipStatusLabel(false),
        cell: membershipBadgeLabel(false),
        word: 'vencidos',
        fill: 'fill-chart-unpaid',
        swatch: 'bg-chart-unpaid',
    },
] as const

/**
 * El padrón partido por la membresía: una barra al 100%, vigentes contra
 * vencidas. Reemplaza a la tarjeta "Membresía vigente · 262 de 450" y a la de
 * Morosos, que desde el 18/09/2026 son parte de este gráfico.
 *
 * **Una sola barra apilada y no una barra por estado**: la pregunta es qué
 * parte del padrón tiene la membresía, y dos partes de un mismo total se leen
 * de un vistazo en una barra que ES el total. Es la anatomía de cada fila de
 * Plantel —pagado a la izquierda, sin pagar a la derecha, la punta redondeada—
 * y con el mismo par de colores: el celeste de `--chart-paid` y el gris de
 * `--chart-unpaid` dicen "pagado" y "sin pagar" en los dos gráficos, así que el
 * mismo color dice lo mismo en toda la pantalla. El gris da 2.5:1 contra la
 * tarjeta (bajo el 3:1 de una marca): lo compensan los rótulos con la cantidad
 * arriba de cada tramo, siempre visibles, la leyenda y la tabla gemela.
 *
 * Solo la membresía, que es la única de las tres coberturas que decide si
 * entra al club (PRODUCT.md). La actividad vencida ya la muestra Plantel, por
 * categoría, y no se repite acá.
 *
 * **Los morosos van en el pie y no como un tercer tramo, porque no son parte
 * de las vencidas.** Un tercer tramo "morosos" adentro del gris afirmaría que
 * cada moroso tiene la membresía vencida, y el backend no lo garantiza: el alta
 * y la importación pueden traer al socio con la marca puesta Y un vencimiento
 * futuro (`mergeImportedFields`, que escribe las dos columnas por separado),
 * corregir la fecha desde la ficha no toca la marca (`update` en
 * `admin-members.service.ts`), y la marca solo se saca pagando la membresía o
 * a mano. El propio contrato lo dice: la marca "se superpone" y "puede incluso
 * estar al día" (`AdminMemberCountsResponseDto`). Además los dos números salen
 * de pedidos distintos, en momentos distintos: aunque la regla se cumpliera,
 * restarlos podría dar un tramo negativo. Si algún día el backend garantiza que
 * la marca cae sola con la membresía vigente, el tercer tramo —en un rojo de la
 * deuda— pasa a ser posible.
 */
export const MembershipCard = ({ query, delinquent }: Props) => {
    const [hover, setHover] = useState<HoverPoint | null>(null)

    // El dato gana sobre el error: con un refetch fallido TanStack deja los
    // dos, y el número viejo sigue siendo mejor que el aviso.
    const delinquentCount = delinquent.data ?? (delinquent.isError ? null : undefined)

    return (
        <StatsCard
            title="Membresía del padrón"
            query={query}
            legend={PARTS.map((part) => ({ label: part.label, swatchClassName: part.swatch }))}
            description={(data) => membershipLine(membershipSummary(data), delinquentCount)}
            chart={(data) => {
                const summary = membershipSummary(data)
                const bar = splitBar(summary.active, summary.expired, W, { gap: GAP, min: MIN })
                const parts = [
                    { ...PARTS[0], count: summary.active, percent: summary.percents?.active },
                    { ...PARTS[1], count: summary.expired, percent: summary.percents?.expired },
                ]
                const hovered = hover ? parts[hover.index] : undefined

                // Cada tramo con su lugar en la barra. El de la izquierda arranca
                // recto, que es la base; la punta redondeada es la del final de
                // la barra, como en Plantel.
                const segments = [
                    { x: 0, width: bar.firstWidth, rounded: bar.secondWidth === 0 },
                    { x: bar.secondX, width: bar.secondWidth, rounded: true },
                ]

                // Dónde termina la zona de hover de la izquierda: en el aire entre
                // los dos tramos, pero sin dejar a ningún lado con menos de
                // `HIT_MIN`, porque un tramo de 3px no se puede apuntar. Con un
                // lado en cero, la barra entera es del otro: el "0 vencidos" de
                // arriba ya dice todo lo que un tooltip diría.
                const boundary =
                    bar.secondWidth === 0
                        ? W
                        : bar.firstWidth === 0
                          ? 0
                          : Math.min(Math.max(bar.firstWidth + GAP / 2, HIT_MIN), W - HIT_MIN)
                const hitAreas = [
                    { x: 0, width: boundary },
                    { x: boundary, width: W - boundary },
                ]

                return (
                    <>
                        <svg
                            viewBox={`0 0 ${W} ${H}`}
                            role="img"
                            aria-label="Socios del padrón con la membresía vigente y vencida"
                            className="block h-auto w-full max-w-[460px] min-w-[26rem] overflow-visible"
                        >
                            {summary.total === 0 ? (
                                <>
                                    {/* Sin padrón, la pista vacía en gris y la frase:
                                        un hueco en blanco parece un gráfico que no
                                        cargó. */}
                                    <path d={barRightPath(0, TOP, W, THICKNESS, 4)} className="fill-muted" />
                                    <text x={0} y={LABELS - 4} className="fill-muted-foreground text-[11px]">
                                        sin socios en el padrón
                                    </text>
                                </>
                            ) : (
                                <>
                                    {/* Los rótulos van en los extremos y no sobre cada
                                        tramo: cada tramo nace en un extremo de la barra,
                                        así que cada rótulo queda arriba del suyo aunque
                                        el tramo mida 3px. Y afuera de la barra porque
                                        adentro del gris ningún color de texto llega al
                                        4.5:1. Se dibujan también en cero: "0 vencidas"
                                        es el dato. */}
                                    {parts.map((part, index) => (
                                        <text
                                            key={part.key}
                                            x={index === 0 ? 0 : W}
                                            y={LABELS - 4}
                                            textAnchor={index === 0 ? 'start' : 'end'}
                                            className="fill-muted-foreground text-xs tabular-nums"
                                        >
                                            <tspan className="fill-ink font-semibold">{part.count}</tspan>
                                            {` ${part.word} · ${percentText(part.percent)}`}
                                        </text>
                                    ))}

                                    {segments.map((segment, index) =>
                                        segment.width > 0 ? (
                                            <path
                                                key={PARTS[index]?.key}
                                                d={
                                                    segment.rounded
                                                        ? barRightPath(segment.x, TOP, segment.width, THICKNESS, 4)
                                                        : `M${segment.x},${TOP} h${segment.width} v${THICKNESS} h-${segment.width} Z`
                                                }
                                                className={PARTS[index]?.fill}
                                            />
                                        ) : null,
                                    )}

                                    {/* El hover va sobre la franja entera de cada lado,
                                        con el renglón del rótulo incluido, y no sobre el
                                        tramo solo. */}
                                    {hitAreas.map((area, index) =>
                                        area.width > 0 ? (
                                            <rect
                                                key={PARTS[index]?.key}
                                                x={area.x}
                                                y={0}
                                                width={area.width}
                                                height={H}
                                                className="fill-transparent hover:fill-muted-foreground/10"
                                                onPointerMove={(event) =>
                                                    setHover({ index, x: event.clientX, y: event.clientY })
                                                }
                                                onPointerLeave={() => setHover(null)}
                                            />
                                        ) : null,
                                    )}
                                </>
                            )}
                        </svg>

                        {hover && hovered && (
                            <StatsTooltip point={hover} title={hovered.label}>
                                <TooltipLine label="Socios" value={hovered.count} swatchClassName={hovered.swatch} />
                                <TooltipLine label="Del padrón" value={percentText(hovered.percent)} total />
                            </StatsTooltip>
                        )}
                    </>
                )
            }}
            table={(data) => {
                const summary = membershipSummary(data)

                return (
                    <StatsTable
                        columns={['Membresía', 'Socios', 'Del padrón']}
                        rows={[
                            {
                                key: PARTS[0].key,
                                cells: [PARTS[0].cell, summary.active, percentText(summary.percents?.active)],
                            },
                            {
                                key: PARTS[1].key,
                                cells: [PARTS[1].cell, summary.expired, percentText(summary.percents?.expired)],
                            },
                        ]}
                        footer={['Total', summary.total, summary.total > 0 ? '100%' : '—']}
                    />
                )
            }}
        />
    )
}
