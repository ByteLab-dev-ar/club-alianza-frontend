import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { PaginationMeta } from '@/api/types'

interface Props {
    meta: PaginationMeta
    onPageChange: (page: number) => void
    /** Deshabilita los botones mientras llega la página nueva. */
    disabled?: boolean
}

export const Pagination = ({ meta, onPageChange, disabled = false }: Props) => {
    if (meta.totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
                {meta.totalItems} {meta.totalItems === 1 ? 'resultado' : 'resultados'}
            </p>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || meta.currentPage <= 1}
                    onClick={() => onPageChange(meta.currentPage - 1)}
                >
                    <ChevronLeft /> Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                    {meta.currentPage} / {meta.totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || meta.currentPage >= meta.totalPages}
                    onClick={() => onPageChange(meta.currentPage + 1)}
                >
                    Siguiente <ChevronRight />
                </Button>
            </div>
        </div>
    )
}
