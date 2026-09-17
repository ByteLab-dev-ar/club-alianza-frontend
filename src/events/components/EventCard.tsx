import { Clock, MapPin } from 'lucide-react'

import { formatCalendarDate } from '@/lib/format'
import type { ClubEvent } from '../interfaces/ClubEvent'
import { formatEventTime } from '../lib/event-time'

interface Props {
    event: ClubEvent
}

export const EventCard = ({ event }: Props) => {
    const month = formatCalendarDate(event.date, 'MMM').toUpperCase()
    const day = formatCalendarDate(event.date, 'd')
    const time = formatEventTime(event.time)

    return (
        <article className="group flex gap-4 rounded-xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-club">
            {/*
             * Con foto, ocupa el lugar del badge de fecha —más ancho y estirado a
             * todo el alto de la tarjeta— y la fecha se apoya encima. Sin foto
             * queda EXACTAMENTE el badge de siempre, y esa es la razón de que sean
             * dos ramas y no un solo bloque con clases condicionales: la agenda
             * mezcla eventos con y sin imagen en la misma grilla, así que la rama
             * sin foto no puede moverse ni un píxel o las tarjetas dejan de
             * alinearse entre ellas.
             */}
            {event.imageUrl ? (
                <div className="relative w-26 shrink-0 self-stretch overflow-hidden rounded-lg bg-accent">
                    <img
                        src={event.imageUrl}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                    />
                    <div className="absolute left-2 top-2 flex size-11 flex-col items-center justify-center rounded-lg bg-card shadow-soft">
                        <span className="kicker text-[10px] text-muted-foreground">{month}</span>
                        <span className="font-display text-lg font-extrabold leading-none text-ink">
                            {day}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <span className="kicker text-[10px] text-muted-foreground">{month}</span>
                    <span className="font-display text-2xl font-extrabold leading-none">{day}</span>
                </div>
            )}

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

                {/*
                 * Hora y lugar pueden faltar: si el evento tiene flyer, esos
                 * datos ya están impresos ahí. La línea no se muestra en blanco
                 * —quedaba un ícono suelto sin texto al lado—, directamente no va.
                 */}
                {time && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-3.5 shrink-0" />
                        {time}
                    </p>
                )}
                {event.location && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </p>
                )}
            </div>
        </article>
    )
}
