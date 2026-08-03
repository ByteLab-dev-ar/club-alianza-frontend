import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PaginationMeta } from '@/api/types'

interface Props {
    meta: PaginationMeta
    onPageChange: (page: number) => void
    /** Deshabilita los botones mientras llega la página nueva. */
    disabled?: boolean
    /**
     * 'between' (por defecto) es el layout de los listados del panel: contador
     * de resultados a la izquierda y controles a la derecha. 'center' es el del
     * sitio público, centrado y sin contador.
     */
    align?: 'between' | 'center'
}

export const Pagination = ({ meta, onPageChange, disabled = false, align = 'between' }: Props) => {
    if (meta.totalPages <= 1) return null

    const isCentered = align === 'center'

    return (
        <div
            className={cn(
                'flex items-center gap-4',
                isCentered ? 'justify-center' : 'justify-between',
            )}
        >
            {!isCentered && (
                <p className="text-sm text-muted-foreground">
                    {meta.totalItems} {meta.totalItems === 1 ? 'resultado' : 'resultados'}
                </p>
            )}

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size={isCentered ? 'default' : 'sm'}
                    disabled={disabled || meta.currentPage <= 1}
                    onClick={() => onPageChange(meta.currentPage - 1)}
                >
                    <ChevronLeft /> Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                    {isCentered
                        ? `Página ${meta.currentPage} de ${meta.totalPages}`
                        : `${meta.currentPage} / ${meta.totalPages}`}
                </span>
                <Button
                    variant="outline"
                    size={isCentered ? 'default' : 'sm'}
                    disabled={disabled || meta.currentPage >= meta.totalPages}
                    onClick={() => onPageChange(meta.currentPage + 1)}
                >
                    Siguiente <ChevronRight />
                </Button>
            </div>
        </div>
    )
}
