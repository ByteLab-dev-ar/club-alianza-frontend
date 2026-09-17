import { Clock, MapPin } from 'lucide-react'

import { formatCalendarDate } from '@/lib/format'
import type { ClubEvent } from '../interfaces/ClubEvent'
import { formatEventTime } from '../lib/event-time'

interface Props {
    event: ClubEvent
}

/**
 * Un evento como FILA de una lista, no como tarjeta suelta.
 *
 * Existe aparte de `EventCard` porque van adentro de contenedores distintos y
 * eso cambia el dibujo: la tarjeta trae su propio borde, su radio y su sombra
 * porque flota sobre la grilla de `/eventos`; acá las filas viven dentro de un
 * bloque que ya tiene todo eso, así que lo único que las separa es el filete de
 * arriba. Metiendo la tarjeta adentro del bloque quedaban dos bordes y dos
 * sombras anidadas.
 *
 * El badge de fecha es el MISMO que el de la tarjeta y tiene que seguir
 * siéndolo: es el elemento por el que se reconoce un evento en todo el sitio.
 */
export const EventRow = ({ event }: Props) => {
    const month = formatCalendarDate(event.date, 'MMM').toUpperCase()
    const day = formatCalendarDate(event.date, 'd')
    const time = formatEventTime(event.time)

    return (
        <article className="flex gap-4 border-t p-5 first:border-t-0">
            <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <span className="kicker text-[10px] text-muted-foreground">{month}</span>
                <span className="font-display text-2xl leading-none font-extrabold">{day}</span>
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-1">
                <h3 className="truncate font-display text-base font-bold text-ink">
                    {event.title}
                </h3>

                {/* Hora y lugar pueden faltar —con flyer, esos datos ya están
                    impresos ahí—, así que la línea no se dibuja vacía. Cuando
                    están las dos, van en una sola fila: la lista es angosta y
                    dos renglones la desbalancean contra el badge de 64px.
                    La condición mira la hora YA formateada y no `event.time`,
                    para que "hay hora" lo decida un solo lugar: el backend
                    acepta cualquier texto de hasta 20, y una hora de puros
                    espacios pasaría el `&&` crudo y dejaría el reloj suelto. */}
                {(time || event.location) && (
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {time && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="size-3.5 shrink-0" />
                                {time}
                            </span>
                        )}
                        {event.location && (
                            <span className="flex min-w-0 items-center gap-1.5">
                                <MapPin className="size-3.5 shrink-0" />
                                <span className="truncate">{event.location}</span>
                            </span>
                        )}
                    </p>
                )}
            </div>
        </article>
    )
}
