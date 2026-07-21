import type { ReactNode } from 'react'

interface Props {
    kicker?: string
    title: string
    description?: string
    /** Acciones alineadas a la derecha (botón "Nuevo", filtros, etc.). */
    actions?: ReactNode
}

export const AdminPageHeader = ({ kicker, title, description, actions }: Props) => {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                {kicker && <p className="kicker text-brand">{kicker}</p>}
                <h1 className="text-display mt-1 text-3xl text-ink">{title}</h1>
                {description && (
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    )
}
