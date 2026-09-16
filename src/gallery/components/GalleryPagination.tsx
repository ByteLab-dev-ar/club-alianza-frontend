import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { PaginationMeta } from '@/api/types'
import { cn } from '@/lib/utils'
import { pageWindow, rangeLabel, type PageWindowItem } from '../lib/page-window'

interface Props {
    meta: PaginationMeta
    /** El `search` de la página N, con el filtro actual. */
    searchFor: (page: number) => string
    /** Mientras llega la página nueva. */
    disabled: boolean
}

const ITEM =
    'inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border bg-card px-2.5 text-sm font-semibold text-foreground tabular-nums transition-colors hover:bg-muted lg:h-10 lg:min-w-10'
const ITEM_CURRENT = 'border-transparent bg-accent text-brand hover:bg-accent'
const ITEM_OFF = 'bg-transparent text-muted-foreground hover:bg-transparent'

/**
 * Paginación numerada del listado. Propia de la galería: la `Pagination`
 * compartida (anterior · "Página 1 de 2" · siguiente) sigue en el panel y en
 * Eventos.
 *
 * Son links y no botones: la página vive en la URL. La actual va en Celeste
 * Chip + Celeste Profundo, el mismo par que el activo de la barra lateral.
 */
export const GalleryPagination = ({ meta, searchFor, disabled }: Props) => {
    // Con 0 resultados el backend manda totalPages 0.
    if (meta.totalPages <= 1) return null

    const { currentPage: current, totalPages: total } = meta

    // Sin esto se podía pasar de la última página con clicks rápidos, porque el
    // meta todavía era el viejo. Con links, `pointer-events-none` corta el
    // mouse y el preventDefault corta el Enter del teclado.
    const blockWhileLoading = (event: MouseEvent) => {
        if (disabled) event.preventDefault()
    }

    const pageLink = (page: number, content: ReactNode, extra: { label?: string; className?: string } = {}) => (
        <Link
            replace
            to={{ search: searchFor(page) }}
            onClick={blockWhileLoading}
            aria-label={extra.label}
            aria-current={page === current ? 'page' : undefined}
            aria-disabled={disabled || undefined}
            className={cn(ITEM, page === current && ITEM_CURRENT, disabled && 'pointer-events-none', extra.className)}
        >
            {content}
        </Link>
    )

    /*
     * Anterior / Siguiente. En el extremo siguen siendo el MISMO Link, apagado
     * con aria-disabled, y no un <span>: con el foco en "Siguiente" en la
     * penúltima página, Enter llevaba a la última, React cambiaba el link por
     * un span y el foco caía a <body> (el próximo Tab arrancaba en el header).
     * Mismo motivo por el que las flechas del escenario no usan `disabled`.
     */
    const edge = (page: number, label: string, icon: ReactNode, iconFirst: boolean) => {
        const isOff = page < 1 || page > total
        return (
            <Link
                replace
                to={{ search: searchFor(isOff ? current : page) }}
                onClick={(event) => {
                    if (isOff) event.preventDefault()
                    else blockWhileLoading(event)
                }}
                aria-disabled={isOff || disabled || undefined}
                className={cn(ITEM, isOff ? [ITEM_OFF, 'cursor-default'] : disabled && 'pointer-events-none')}
            >
                {iconFirst && icon}
                {/* Debajo de 40rem queda solo la flecha: con las palabras, cinco
                    números no entraban en 342px. */}
                <span className="max-sm:sr-only">{label}</span>
                {!iconFirst && icon}
            </Link>
        )
    }

    const numbers = (items: PageWindowItem[], className: string, keyPrefix: string) =>
        items.map((item, index) => (
            <li key={`${keyPrefix}-${item === 'gap' ? `gap-${index}` : item}`} className={className}>
                {item === 'gap' ? (
                    <span aria-hidden className={cn(ITEM, ITEM_OFF, 'min-w-6 border-0 px-0 lg:min-w-6')}>
                        …
                    </span>
                ) : (
                    pageLink(item, item, { label: `Página ${item}` })
                )}
            </li>
        ))

    return (
        <nav aria-label="Paginación" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">{rangeLabel(meta)}</p>
            <ul className="ml-auto flex items-center gap-1 sm:gap-1.5">
                <li>{edge(current - 1, 'Anterior', <ChevronLeft className="size-4" />, true)}</li>
                {/* Dos ventanas y una sola visible: en el celular, sin vecinas
                    (cinco lugares); desde sm, con una por lado. Con siete
                    lugares y las flechas de 44px la fila no entraba en 390. */}
                {numbers(pageWindow(current, total, 0), 'sm:hidden', 'celular')}
                {numbers(pageWindow(current, total, 1), 'max-sm:hidden', 'ancho')}
                <li>{edge(current + 1, 'Siguiente', <ChevronRight className="size-4" />, false)}</li>
            </ul>
        </nav>
    )
}
