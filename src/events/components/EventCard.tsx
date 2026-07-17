import { Clock, MapPin } from 'lucide-react'

import { formatCalendarDate } from '@/lib/format'
import type { ClubEvent } from '../interfaces/ClubEvent'

interface Props {
    event: ClubEvent
}

export const EventCard = ({ event }: Props) => {
    return (
        <article className="group flex gap-4 rounded-xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-club">
            <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <span className="kicker text-[10px] text-muted-foreground">
                    {formatCalendarDate(event.date, 'MMM').toUpperCase()}
                </span>
                <span className="font-display text-2xl font-extrabold leading-none">
                    {formatCalendarDate(event.date, 'd')}
                </span>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
                {event.category && (
                    <span
                        className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                        style={{
                            // Cada categoría define su color hex en el backend; lo usamos
                            // como tinte del chip en vez de mapear categorías a clases fijas.
                            backgroundColor: `${event.category.color}1f`,
                            color: event.category.color,
                        }}
                    >
                        {event.category.name}
                    </span>
                )}

                <h3 className="truncate font-display text-base font-bold text-ink">{event.title}</h3>

                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    {event.time} hs
                </p>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                </p>
            </div>
        </article>
    )
}
