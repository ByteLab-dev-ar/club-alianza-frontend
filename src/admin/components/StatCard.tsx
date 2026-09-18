import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CardProps {
    label: string
    icon: LucideIcon
    /** Resalta la tarjeta (los comprobantes por revisar, cuando hay alguno). */
    highlight?: boolean
    /**
     * Con destino, la tarjeta entera es el link.
     *
     * Entera y no un "Ver" abajo: el número ES el link a la pantalla donde se
     * resuelve, y un link de 60px adentro de una tarjeta de 300 es un blanco
     * más chico por nada. Sin `to` sigue siendo un `div`, que es lo correcto
     * para los números que no llevan a ningún lado: hoy, todos menos
     * "Comprobantes por revisar", que es el único que es una bandeja de trabajo
     * en una pantalla que abren los dos roles del Resumen. Membresía vigente,
     * Actividad vencida y Morosos se resolverían en Socios, que tesorería no
     * abre, y un link que a uno de los dos roles le da "sin permiso" es peor
     * que ninguno.
     */
    to?: string
}

interface Props extends CardProps {
    value: string | number
    hint?: string
}

/** El marco: la caja, el rótulo con su ícono y, si hay `to`, el link. */
const StatFrame = ({ label, icon: Icon, highlight = false, to, children }: CardProps & { children: ReactNode }) => {
    const className = cn(
        'block rounded-xl border bg-card p-6 shadow-soft',
        highlight && 'border-warning/40 bg-warning/5',
        // El mismo par que las filas clickeables del panel (ver CounterPage y
        // MemberDocuments): sin ninguna reacción al mouse, una tarjeta que
        // navega no se distingue de las otras cinco, que no.
        to &&
            'transition-colors outline-none hover:border-secondary hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
    )

    const content = (
        <>
            {/* `gap-3`: "Comprobantes por revisar" es el rótulo más largo de la
                fila y, en las columnas más angostas, llega hasta el ícono. Sin
                el aire, las dos cosas se tocan antes de que el rótulo baje de
                renglón. */}
            <div className="flex items-center justify-between gap-3">
                <p className="kicker text-muted-foreground">{label}</p>
                {/* `warning-strong` y no `warning`: el ámbar de la marca da
                    2.4:1 sobre el relleno claro de la tarjeta resaltada y un
                    ícono necesita 3:1 (ARR-4). En el panel oscuro el token vale
                    lo mismo que `--warning`, así que no cambia nada ahí. */}
                <Icon className={cn('size-5 shrink-0', highlight ? 'text-warning-strong' : 'text-brand')} />
            </div>
            {children}
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

export const StatCard = ({ value, hint, ...card }: Props) => (
    <StatFrame {...card}>
        <p className="text-display mt-3 text-3xl text-ink">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </StatFrame>
)

interface QueryProps<T> extends Omit<CardProps, 'highlight'> {
    /** El estado de SU query, que no es la de `/admin/dashboard`. */
    query: { data: T | undefined; isError: boolean }
    /** El número y su pie, ya escritos, cuando la query respondió. */
    show: (data: T) => { value: string | number; hint?: string }
}

/**
 * Una tarjeta cuyo número sale de otro endpoint que el del Resumen, y que por
 * eso carga y falla por su cuenta, como los gráficos de abajo (`StatsCard`).
 *
 * **Se dibuja siempre, también mientras carga o si falló.** Hasta el
 * 18/09/2026 "Pagos por el portal" directamente no aparecía hasta tener su
 * dato, y con una sola tarjeta así daba igual. Con tres, cada una que falta le
 * deja a la fila una tarjeta suelta —cinco en una grilla de dos o de tres— y
 * la grilla se arma y se desarma mientras las respuestas llegan en cualquier
 * orden. Además una tarjeta que no está no avisa nada: si su endpoint se caía,
 * nadie se enteraba de que faltaba un número.
 *
 * Cargando, el lugar del número lleva un esqueleto del alto del texto, para
 * que la tarjeta no crezca cuando llega. Con error, un guion y el motivo, en
 * el mismo tono que el aviso de los gráficos.
 *
 * Sin `highlight`: ninguna de estas es una tarea pendiente, y el ámbar de la
 * fila es de los comprobantes sin revisar.
 */
export const QueryStatCard = <T,>({ query, show, ...card }: QueryProps<T>) => {
    if (query.data !== undefined) return <StatCard {...card} {...show(query.data)} />

    if (query.isError) return <StatCard {...card} value="—" hint="No pudimos cargar este número" />

    return (
        <StatFrame {...card}>
            {/* Las mismas alturas de línea que el número (`text-3xl`, 36px) y
                el pie (`text-xs`, 16px), con el gris un poco más bajo adentro. */}
            <div className="mt-3 flex h-9 items-center">
                <Skeleton className="h-7 w-24" />
            </div>
            <div className="mt-1 flex h-4 items-center">
                <Skeleton className="h-3 w-40 max-w-full" />
            </div>
        </StatFrame>
    )
}
