import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface LegendItem {
    label: string
    /** La clase `bg-chart-*` del muestrario. Escrita entera, para que Tailwind la vea. */
    swatchClassName: string
}

interface Props<T> {
    title: string
    /** El estado de SU query: cada tarjeta carga y falla por su cuenta. */
    query: { data: T | undefined; isLoading: boolean; isError: boolean }
    description: (data: T) => ReactNode
    /** Solo con dos series o más: una serie sola la nombra el título. */
    legend?: LegendItem[]
    chart: (data: T) => ReactNode
    /** La tabla gemela, con los mismos números que el gráfico. */
    table: (data: T) => ReactNode
    className?: string
}

/**
 * La tarjeta de un gráfico del Resumen.
 *
 * Cada una recibe el estado de su propia query y resuelve sola la carga y el
 * error: un endpoint caído deja un aviso en SU tarjeta, y las otras cinco y los
 * números de arriba siguen en pantalla.
 *
 * "Ver tabla" no es un extra. El color no puede ser el único canal —el gris
 * de "sin pagar" no llega a 3:1 contra la tarjeta— y hay datos, como los
 * importes exactos de cada mes, que el gráfico solo muestra pasando el mouse.
 * La tabla los deja leer a cualquiera, con teclado o con un lector de pantalla.
 */
export const StatsCard = <T,>({ title, query, description, legend, chart, table, className }: Props<T>) => {
    const [showTable, setShowTable] = useState(false)
    const { data, isLoading, isError } = query

    return (
        <section className={cn('flex min-w-0 flex-col rounded-xl border bg-card p-6 shadow-soft sm:p-8', className)}>
            <header className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">{title}</h2>
                    {data !== undefined && (
                        <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">{description(data)}</p>
                    )}
                </div>

                {data !== undefined && (
                    <Button
                        variant="outline"
                        size="sm"
                        aria-pressed={showTable}
                        onClick={() => setShowTable((current) => !current)}
                    >
                        {showTable ? 'Ver gráfico' : 'Ver tabla'}
                    </Button>
                )}
            </header>

            {isLoading && <Skeleton className="mt-6 h-56 rounded-lg" />}

            {isError && (
                <p className="mt-6 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No pudimos cargar este gráfico. El resto del resumen no depende de él.
                </p>
            )}

            {data !== undefined &&
                (showTable ? (
                    <div className="mt-5">{table(data)}</div>
                ) : (
                    <>
                        {legend && (
                            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                                {legend.map((item) => (
                                    <li
                                        key={item.label}
                                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                                    >
                                        <span className={cn('size-2.5 rounded-[3px]', item.swatchClassName)} />
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* El SVG tiene un ancho mínimo y scrollea adentro de la
                            tarjeta: escalado a un teléfono, un eje de doce meses
                            deja los rótulos en tres píxeles. */}
                        <div className="mt-4 overflow-x-auto">{chart(data)}</div>
                    </>
                ))}
        </section>
    )
}
