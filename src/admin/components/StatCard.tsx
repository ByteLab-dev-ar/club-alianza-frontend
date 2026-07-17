import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Props {
    label: string
    value: string | number
    icon: LucideIcon
    hint?: string
    /** Resalta la tarjeta (ej. pagos pendientes cuando hay > 0). */
    highlight?: boolean
}

export const StatCard = ({ label, value, icon: Icon, hint, highlight = false }: Props) => {
    return (
        <div
            className={cn(
                'rounded-xl border bg-card p-6 shadow-soft',
                highlight && 'border-warning/40 bg-warning/5',
            )}
        >
            <div className="flex items-center justify-between">
                <p className="kicker text-muted-foreground">{label}</p>
                <Icon className={cn('size-5', highlight ? 'text-warning' : 'text-secondary')} />
            </div>
            <p className="text-display mt-3 text-3xl text-ink">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}
