import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { HistoryMilestone } from '../interfaces/Institutional'

interface Props {
    milestone: HistoryMilestone
    /** Los pares van a la izquierda de la línea y los impares a la derecha. */
    index: number
}

export const MilestoneItem = ({ milestone, index }: Props) => {
    const isLeft = index % 2 === 0

    return (
        <li
            className={cn(
                'relative pb-12 pl-16 last:pb-0',
                // En escritorio la línea pasa por el centro y las tarjetas alternan
                // de lado; en mobile queda todo a la derecha de la línea.
                'lg:flex lg:pl-0',
                isLeft ? 'lg:justify-start' : 'lg:justify-end',
            )}
        >
            {/* Punto sobre la línea */}
            <span
                aria-hidden
                className="absolute top-6 left-6 z-10 grid size-5 -translate-x-1/2 place-items-center rounded-full bg-background lg:left-1/2"
            >
                <span className="size-3 rounded-full bg-secondary shadow-glow" />
            </span>

            <article className="reveal-up rounded-xl border bg-card p-6 shadow-soft lg:w-[calc(50%-3rem)]">
                <p className="text-display text-3xl text-brand">{milestone.year}</p>
                <h2 className="mt-2 font-display text-lg font-bold text-ink">{milestone.title}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{milestone.description}</p>
            </article>
        </li>
    )
}

export const MilestoneSkeleton = () => (
    <li className="relative pb-12 pl-16 lg:flex lg:pl-0 lg:even:justify-end">
        <Skeleton className="h-36 rounded-xl lg:w-[calc(50%-3rem)]" />
    </li>
)
