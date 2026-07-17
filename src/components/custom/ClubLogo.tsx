import { cn } from '@/lib/utils'

interface Props {
    className?: string
    /** En superficies oscuras (hero, sidebar) el texto va en claro. */
    inverted?: boolean
}

/** Escudo + wordmark. Es el bloque de marca que abre el header y el footer. */
export const ClubLogo = ({ className, inverted = false }: Props) => {
    return (
        <span className={cn('flex items-center gap-3', className)}>
            <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-dark shadow-soft"
            >
                <svg viewBox="0 0 24 28" className="size-6 fill-none" role="presentation">
                    <path
                        d="M12 1.5 22 5v9c0 6.2-4.2 11-10 12.5C6.2 25 2 20.2 2 14V5l10-3.5Z"
                        className="fill-secondary/25 stroke-secondary"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M12 7.5 15.5 18h-2.2l-.7-2.3h-3.2L8.7 18H6.5L10 7.5h2Zm-.5 3.4-1 3.3h2l-1-3.3Z"
                        className="fill-secondary"
                    />
                </svg>
            </span>
            <span className="flex flex-col leading-none">
                <span
                    className={cn(
                        'font-display text-lg font-extrabold tracking-tight',
                        inverted ? 'text-white' : 'text-ink',
                    )}
                >
                    Club Alianza
                </span>
                <span
                    className={cn(
                        'mt-1 text-[10px] font-semibold tracking-[0.2em]',
                        inverted ? 'text-white/60' : 'text-muted-foreground',
                    )}
                >
                    DESDE 1944
                </span>
            </span>
        </span>
    )
}
