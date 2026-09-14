import { todayIso } from '@/lib/format'
import { pastDateLabel } from '../lib/agenda-months'
import type { ClubEvent } from '../interfaces/ClubEvent'

interface Props {
    event: ClubEvent
}

/**
 * Un evento que ya pasó, como renglón de una lista.
 *
 * No repite la grilla de pósters de arriba a propósito: lo que ya pasó es
 * referencia, no invitación. Nadie mira el flyer de un partido de hace dos
 * meses para ir, así que el flyer no está y entran cinco veces más eventos por
 * pantalla.
 */
export const PastEventRow = ({ event }: Props) => {
    return (
        <article className="flex items-center gap-4 border-t px-5 py-3.5 first:border-t-0">
            <span className="w-24 shrink-0 text-sm text-muted-foreground tabular-nums">
                {pastDateLabel(event.date, todayIso())}
            </span>

            <h3 className="min-w-0 flex-1 truncate font-display text-base font-bold text-ink">
                {event.title}
            </h3>

            {/* En pantalla angosta el lugar se va: entre truncar el título y
                sacar el dato menos buscado de la lista, se saca el dato. */}
            {event.location && (
                <span className="shrink-0 text-sm text-muted-foreground max-sm:hidden">
                    {event.location}
                </span>
            )}
        </article>
    )
}
