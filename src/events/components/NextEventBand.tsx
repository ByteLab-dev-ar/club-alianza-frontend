import crestMaster from '@/assets/logo-no-bg-alianza.png'
import { formatCalendarDate } from '@/lib/format'
import type { ClubEvent } from '../interfaces/ClubEvent'
import { formatEventTime } from '../lib/event-time'

interface Props {
    event: ClubEvent
}

/**
 * El próximo evento, como franja oscura a sangre antes de la agenda.
 *
 * Es el bloque partido del sistema —sección a sangre, foto de un lado y panel
 * de color plano del otro— puesto al servicio de la jerarquía: el próximo no es
 * una tarjeta destacada dentro de la grilla, es otra cosa, y por eso no compite
 * con las que vienen abajo. El destaque lo hace la SUPERFICIE; no hay filete de
 * color, ni sombra larga, ni tarjeta agrandada.
 *
 * Dos cosas que no son gusto:
 *
 * 1. **Sin radio.** Las secciones a sangre van de borde a borde con corte
 *    recto: el radio es del componente, nunca del bloque de página. Lo que
 *    sangra es el fondo; el contenido se alinea con el resto de la página.
 *
 * 2. **El flyer no se recorta**, igual que en la tarjeta de la agenda: viene de
 *    Instagram con la hora y el lugar impresos abajo de todo, y cualquier
 *    `cover` se come justo ese dato. Va entero sobre una copia borrosa de sí
 *    mismo, que es lo que rellena la banda que sobra.
 */
export const NextEventBand = ({ event }: Props) => {
    const when = formatCalendarDate(event.date, "EEEE d 'de' MMMM")

    // Como en la tarjeta: los dos pueden faltar y el separador no puede quedar
    // colgado. Sin ninguno de los dos, la línea no se dibuja.
    const details = [formatEventTime(event.time), event.location].filter(Boolean).join(' · ')

    return (
        <section className="bg-ink">
            {/*
             * A sangre va el NEGRO, no las columnas. Con la grilla de borde a
             * borde, en un monitor de 1920 la foto medía 760 px y el texto
             * arrancaba lejísimos del filete de "Lo que viene": la franja se
             * despegaba de la página. Desde `lg` las dos columnas se alinean
             * con el contenedor de todo lo demás y el negro sigue hasta los
             * bordes. En mobile la foto sí va de borde a borde, que es donde
             * el ancho de la pantalla ya es el del contenido.
             */}
            <div className="grid lg:mx-auto lg:max-w-7xl lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:px-6">
                {event.imageUrl ? (
                    // En mobile la foto va arriba —es la regla de los bloques
                    // partidos— y toma la proporción del propio flyer, para que
                    // se vea del tamaño que se ve en la grilla y no en
                    // miniatura.
                    <div className="relative overflow-hidden max-lg:aspect-[4/5] lg:min-h-[24rem]">
                        <img
                            src={event.imageUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 size-full scale-110 object-cover blur-xl saturate-125"
                        />
                        <img
                            src={event.imageUrl}
                            alt={`Flyer de ${event.title}`}
                            // Esta pantalla no le pasa foto al encabezado, así
                            // que el flyer de acá es el elemento LCP: sin
                            // prioridad alta espera detrás de los flyers de la
                            // grilla, que están más abajo.
                            fetchPriority="high"
                            className="relative size-full object-contain"
                        />
                    </div>
                ) : (
                    /*
                     * Sin flyer, el escudo sobre el mismo negro. No se le
                     * inventa una foto al evento ni se pinta media franja de
                     * celeste —a este tamaño sería la superficie más grande de
                     * la pantalla, y el celeste es acento—, así que la mitad
                     * queda oscura y el escudo la sostiene.
                     *
                     * La placa clara es la misma solución que `ClubLogo` usa en
                     * el pie y en el login, por el mismo motivo: el escudo trae
                     * el nombre del club en negro sobre transparente y sobre
                     * fondo oscuro ese anillo se borra. Va cuadrada-redondeada
                     * y no circular porque el escudo es cuadrado.
                     *
                     * Y va el master de 500px y no el recorte de 132 que usa el
                     * resto del sitio: dibujado a este tamaño el chico es una
                     * ampliación que en retina se ve sucia. Lo paga solo esta
                     * pantalla, y solo cuando el próximo no trae flyer.
                     */
                    <div className="flex items-center justify-center max-lg:h-56 lg:min-h-[24rem]">
                        <div className="rounded-xl bg-white/95 p-4 shadow-soft">
                            <img
                                src={crestMaster}
                                alt=""
                                aria-hidden
                                className="w-32 lg:w-44"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
                    <div className="max-w-xl">
                        {/* Celeste brillante, que es el que se lee sobre oscuro. */}
                        <p className="kicker text-secondary">El próximo · {when}</p>

                        {/* Un escalón por debajo del `h1` de la página en todos
                            los anchos: con `sm:text-4xl` entre 640 y 1024 px
                            medía exactamente lo mismo que "Agenda celeste" y los
                            separaba solo el color. */}
                        <h3 className="text-display mt-3 text-3xl text-balance text-white lg:text-4xl">
                            {event.title}
                        </h3>

                        {details && <p className="mt-3 text-white/70">{details}</p>}
                    </div>
                </div>
            </div>
        </section>
    )
}
