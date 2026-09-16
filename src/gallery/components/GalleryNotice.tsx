import type { ReactNode } from 'react'
import { Images } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Props {
    title: string
    description?: string
    /** Un botón (outline) que saca del callejón: ver todos, reintentar. */
    action?: ReactNode
    /** `alert` para los errores, que se anuncian solos. */
    role?: 'alert'
    className?: string
}

/**
 * La caja punteada de la galería para lo que no es contenido: categoría vacía,
 * galería sin momentos, momento sin fotos, error de carga. Una sola caja para
 * todos, así un vacío se reconoce igual en el listado y en el momento.
 */
export const GalleryNotice = ({ title, description, action, role, className }: Props) => (
    <div
        role={role}
        className={cn(
            'grid justify-items-center gap-3 rounded-lg border border-dashed border-input bg-card px-6 py-14 text-center',
            className,
        )}
    >
        <Images aria-hidden className="size-7 text-muted-foreground" />
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && (
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
    </div>
)
