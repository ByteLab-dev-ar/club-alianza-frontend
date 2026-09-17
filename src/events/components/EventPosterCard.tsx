import crest from '@/assets/logo-crest-132.png'
import { formatCalendarDate } from '@/lib/format'
import type { ClubEvent } from '../interfaces/ClubEvent'
import { formatEventTime } from '../lib/event-time'

interface Props {
    event: ClubEvent
}

/**
 * La tarjeta de la agenda completa (`/eventos`), donde el flyer manda.
 *
 * Es un componente aparte de `EventCard` —el de la landing— y no una variante
 * con props: allá la agenda es un vistazo rápido al costado del resto del
 * contenido, y acá la página ES la agenda, así que el flyer se muestra entero.
 * Mezclarlas terminaba en un componente con un `variant` que cambiaba todo
 * menos el nombre.
 *
 * Las dos decisiones que no son obvias:
 *
 * 1. `object-contain` y no `object-cover`. Los flyers salen de Instagram en
 *    1:1, 4:5 y 9:16, y el diseñador les pone la hora y el lugar abajo de todo.
 *    Cualquier recorte se come justo ese dato, que muchas veces es el único que
 *    existe (ver el comentario de `time` en la interfaz).
 *
 * 2. La banda que sobra se rellena con una copia borrosa del propio flyer, como
 *    hacen Instagram y YouTube, en vez de gris plano. Es la misma imagen, así
 *    que no cuesta una descarga extra.
 */
export const EventPosterCard = ({ event }: Props) => {
    const month = formatCalendarDate(event.date, 'MMM').toUpperCase()
    const day = formatCalendarDate(event.date, 'd')

    // Se arma por partes porque los dos pueden faltar y el separador no puede
    // quedar colgado: sin hora, la línea empieza directamente en el lugar.
    const details = [formatEventTime(event.time), event.location].filter(Boolean).join(' · ')

    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft transition-shadow hover:shadow-club">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {event.imageUrl ? (
                    <>
                        <img
                            src={event.imageUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 size-full scale-110 object-cover blur-xl saturate-125"
                        />
                        <img
                            src={event.imageUrl}
                            alt={`Flyer de ${event.title}`}
                            loading="lazy"
                            className="relative size-full object-contain"
                        />
                    </>
                ) : (
                    // Sin flyer, un cartel con el degradé que el sitio ya usa y el
                    // escudo. Sin esto la tarjeta quedaba cinco veces más baja que
                    // las vecinas y la grilla se veía rota.
                    <div className="flex size-full items-center justify-center bg-gradient-cyan">
                        <img src={crest} alt="" className="w-[38%] drop-shadow-lg" />
                    </div>
                )}
            </div>

            <div className="flex gap-3 p-4">
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <span className="kicker text-[10px] text-muted-foreground">{month}</span>
                    <span className="font-display text-xl font-extrabold leading-none">{day}</span>
                </div>

                <div className="flex min-w-0 flex-col gap-1">
                    {event.category && (
                        <span
                            className="w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                            style={{
                                // Igual que en EventCard: el hex lo define cada
                                // categoría en el backend.
                                backgroundColor: `${event.category.color}1f`,
                                color: event.category.color,
                            }}
                        >
                            {event.category.name}
                        </span>
                    )}

                    {/* h4 y no h3: en la agenda cada tarjeta cuelga del rótulo
                        del mes, que es el h3. Con los dos en h3, quien navega
                        por encabezados oía "septiembre" como si fuera un evento
                        más y no el tramo que los agrupa. */}
                    <h4 className="line-clamp-2 font-display text-base font-bold text-ink">
                        {event.title}
                    </h4>

                    {details && (
                        <p className="truncate text-sm text-muted-foreground">{details}</p>
                    )}
                </div>
            </div>
        </article>
    )
}
