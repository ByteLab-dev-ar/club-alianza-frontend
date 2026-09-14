import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

export interface HoverPoint {
    /** Qué fila, mes o tramo está bajo el puntero. */
    index: number
    x: number
    y: number
}

interface Props {
    point: HoverPoint
    title: string
    children: ReactNode
}

/**
 * El tooltip de los gráficos del Resumen, pegado al puntero.
 *
 * Va por portal a `<body>` y con `position: fixed`: adentro de la tarjeta lo
 * recortaría el `overflow` que deja scrollear el SVG en pantalla chica. El
 * modo oscuro no se pierde en el viaje porque la clase `.dark` vive en
 * `<html>`, no en el marco del panel.
 *
 * Se da vuelta cerca del borde derecho y del de arriba en vez de medirse: no
 * hace falta exactitud, hace falta que no se salga de la ventana.
 */
export const StatsTooltip = ({ point, title, children }: Props) => {
    const flipX = point.x > window.innerWidth - 260
    const below = point.y < 160

    return createPortal(
        <div
            aria-hidden
            className="pointer-events-none fixed z-50 min-w-40 rounded-lg border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-soft"
            style={{
                left: point.x,
                top: point.y,
                transform: `translate(${flipX ? 'calc(-100% - 14px)' : '14px'}, ${below ? '16px' : 'calc(-100% - 12px)'})`,
            }}
        >
            <p className="mb-1.5 font-bold text-ink">{title}</p>
            {children}
        </div>,
        document.body,
    )
}

interface LineProps {
    label: string
    value: ReactNode
    swatchClassName?: string
    /** El renglón del total, separado por un filete. */
    total?: boolean
}

export const TooltipLine = ({ label, value, swatchClassName, total = false }: LineProps) => (
    <div className={cn('mt-1 flex items-center gap-2 tabular-nums', total && 'mt-2 border-t pt-2')}>
        {swatchClassName && <span className={cn('size-2 shrink-0 rounded-[2px]', swatchClassName)} />}
        <span>{label}</span>
        <span className="ml-auto pl-4 font-semibold text-ink">{value}</span>
    </div>
)
