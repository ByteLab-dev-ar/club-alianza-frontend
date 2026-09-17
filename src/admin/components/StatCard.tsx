import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { cn } from '@/lib/utils'

interface Props {
    label: string
    value: string | number
    icon: LucideIcon
    hint?: string
    /** Resalta la tarjeta (ej. pagos pendientes cuando hay > 0). */
    highlight?: boolean
    /**
     * Con destino, la tarjeta entera es el link.
     *
     * Entera y no un "Ver" abajo: el número ES el link a la pantalla donde se
     * resuelve, y un link de 60px adentro de una tarjeta de 300 es un blanco
     * más chico por nada. Sin `to` sigue siendo un `div`, que es lo correcto
     * para los números que no llevan a ningún lado, que hoy son todos menos
     * el de las sugerencias de grupo.
     */
    to?: string
}

export const StatCard = ({ label, value, icon: Icon, hint, highlight = false, to }: Props) => {
    const className = cn(
        'block rounded-xl border bg-card p-6 shadow-soft',
        highlight && 'border-warning/40 bg-warning/5',
        // El mismo par que las filas clickeables del panel (ver CounterPage y
        // MemberDocuments): sin ninguna reacción al mouse, una tarjeta que
        // navega no se distingue de las cinco que no.
        to &&
            'transition-colors outline-none hover:border-secondary hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40',
    )

    const content = (
        <>
            <div className="flex items-center justify-between">
                <p className="kicker text-muted-foreground">{label}</p>
                {/* `warning-strong` y no `warning`: el ámbar de la marca da
                    2.4:1 sobre el relleno claro de la tarjeta resaltada y un
                    ícono necesita 3:1 (ARR-4). En el panel oscuro el token vale
                    lo mismo que `--warning`, así que no cambia nada ahí. */}
                <Icon className={cn('size-5', highlight ? 'text-warning-strong' : 'text-brand')} />
            </div>
            <p className="text-display mt-3 text-3xl text-ink">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
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
