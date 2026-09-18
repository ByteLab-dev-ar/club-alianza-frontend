import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

interface Props {
    label: string
    value: string | number
    icon: LucideIcon
    hint: string
    /** Resalta la tarjeta: las transferencias por revisar, cuando hay alguna. */
    highlight?: boolean
    /**
     * Con destino, la tarjeta entera es el link.
     *
     * Entera y no un "Ver" abajo: el número ES el link a la pantalla donde se
     * resuelve, y un link de 60px adentro de una tarjeta de 300 es un blanco
     * más chico por nada.
     *
     * De las tres del Resumen solo lo lleva "Transferencias por revisar", que
     * es la única bandeja de trabajo y va a Pagos, que abren los dos roles de
     * esta pantalla. "Ingresos del mes" y "Total de socios" son números para
     * leer, no para resolver: el primero no tiene una pantalla que lo explique y
     * el segundo se resolvería en Socios, que tesorería no abre —un link que a
     * uno de los dos roles le da "sin permiso" es peor que ninguno—. Sin `to`
     * sigue siendo un `div`.
     */
    to?: string
}

/**
 * Una de las tres tarjetas del Resumen: "Transferencias por revisar", "Ingresos
 * del mes" y "Total de socios". El resto de lo que el Resumen cuenta va en
 * gráficos (ver `DashboardPage`).
 *
 * **Las tres filas de adentro —rótulo, número, pie— son las filas de la grilla
 * de afuera** (`grid-rows-subgrid`, y por eso `row-span-3`). Es lo que alinea el
 * número de las tres tarjetas en una misma línea: "Transferencias por revisar"
 * es el rótulo más largo y en las columnas angostas baja a dos renglones
 * mientras los otros dos entran en uno. Con cada tarjeta armando sus filas por
 * su cuenta, ese renglón de más empujaba solo su número 16px más abajo que los
 * vecinos; con la subgrilla, la fila del rótulo mide lo del más alto y los tres
 * números arrancan juntos. Lo mismo con el pie, que en esos anchos también
 * puede partirse.
 *
 * `gap-y-0` pisa el `gap-5` que la subgrilla hereda de la grilla de afuera: ese
 * espacio es entre tarjetas, no entre el rótulo y su número. El aire de adentro
 * lo dan los márgenes, como siempre.
 */
export const StatCard = ({ label, value, icon: Icon, hint, highlight = false, to }: Props) => {
    const className = cn(
        'row-span-3 grid grid-rows-subgrid gap-y-0 rounded-xl border bg-card p-6 shadow-soft',
        highlight && 'border-warning/40 bg-warning/5',
        // El mismo par que las filas clickeables del panel (ver CounterPage y
        // MemberDocuments): sin ninguna reacción al mouse, una tarjeta que
        // navega no se distingue de las otras dos, que no.
        to &&
            'transition-colors outline-none hover:border-secondary hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
    )

    const content = (
        <>
            {/* `gap-3`: en las columnas más angostas "Transferencias por
                revisar" llega hasta el ícono, y sin el aire las dos cosas se
                tocan antes de que el rótulo baje de renglón.

                `self-start`: la fila mide lo del rótulo más alto de las tres
                tarjetas, y estirado a esa altura el `items-center` bajaba el
                rótulo de un renglón hasta el medio de la fila, desalineado con
                el primer renglón del vecino. Arriba de todo, los tres rótulos
                arrancan en la misma línea. */}
            <div className="flex items-center justify-between gap-3 self-start">
                <p className="kicker text-muted-foreground">{label}</p>
                {/* `warning-strong` y no `warning`: el ámbar de la marca da
                    2.4:1 sobre el relleno claro de la tarjeta resaltada y un
                    ícono necesita 3:1 (ARR-4). En el panel oscuro el token vale
                    lo mismo que `--warning`, así que no cambia nada ahí. El
                    número y el pie siguen en tinta y en gris: el ámbar no llega
                    al 4.5:1 de un texto (DESIGN.md, Alerta Fuerte). */}
                <Icon className={cn('size-5 shrink-0', highlight ? 'text-warning-strong' : 'text-brand')} />
            </div>
            <p className="text-display mt-3 self-start text-3xl text-ink">{value}</p>
            <p className="mt-1 self-start text-xs text-muted-foreground">{hint}</p>
        </>
    )

    if (to) {
        return (
            <Link to={to} className={className}>
                {content}
            </Link>
        )
    }

    return <div className={className}>{content}</div>
}
