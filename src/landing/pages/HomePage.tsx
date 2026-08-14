import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import canchaImage from '@/assets/cancha.webp'
import heroImage from '@/assets/hero.webp'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCard } from '@/events/components/EventCard'
import { useEvents } from '@/events/hooks/useEvents'

const HIGHLIGHTS = [
    {
        title: 'Deporte de alto nivel',
        description: 'Primera división regional y categorías inferiores desde los 6 años.',
    },
    {
        title: 'Comunidad activa',
        description: 'Asados, peñas y actividades sociales todo el año.',
    },
    {
        title: 'Agenda viva',
        description: 'Más de 80 eventos al año entre partidos, torneos y celebraciones.',
    },
]

// Solo lo que el portal hace de verdad. Nada de beneficios ni medios de pago
// que el sistema no soporta: si se promete acá, después hay que cumplirlo.
const MEMBERSHIP_PERKS = [
    'Credencial digital con QR',
    'Seguí el estado de tu cuota',
    'Subí el comprobante desde el celular',
]

export const HomePage = () => {
    // Solo los próximos cuatro: el listado completo vive en /eventos.
    const { data, isLoading, isError } = useEvents({ limit: 4 })
    const events = data?.items ?? []

    return (
        <>
            {/* ---------------------------------------------------------------- Hero */}
            {/* Split en 2/5 para el panel y 3/5 para la foto. Al vivir el texto
                sobre negro sólido y no sobre la imagen, desaparece la necesidad del
                velo: la tribuna se ve entera y el contraste del titular es máximo
                sin tener que medir nada. En móvil se apila, con la foto arriba. */}
            <section className="grid bg-ink lg:min-h-[min(82vh,42rem)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="flex items-center justify-center px-6 py-14 sm:px-8 lg:px-10 lg:py-16">
                    {/* Centrado dentro del panel. Alinearlo contra el borde del
                        contenedor del header solo funciona cuando la ventana supera
                        el ancho máximo del sitio; por debajo el bloque queda flotando
                        sin relación con nada. El eje del panel siempre existe. */}
                    <div className="max-w-md text-center">
                        <p className="kicker text-secondary">
                            Temporada {new Date().getFullYear()} en marcha
                        </p>

                        {/* Fluido en vez de por breakpoints: es el mismo clamp de la
                            maqueta, así el titular crece parejo con la ventana en
                            lugar de saltar de golpe al cruzar un umbral. */}
                        <h1 className="text-display mt-4 text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.06] text-white">
                            Pasión <span className="text-secondary">celeste</span>
                            <br />
                            en <span className="text-secondary">Cutral Có</span>
                        </h1>

                        <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/70">
                            Somos más que un club: somos comunidad, historia y futuro. Sumate al
                            sentimiento que se vive cancha adentro y afuera.
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button asChild variant="hero" size="lg">
                                <Link to="/asociarse">
                                    Asociate ahora <ArrowRight />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                            >
                                <Link to="/eventos">Ver eventos</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="relative max-lg:order-first max-lg:aspect-[4/3]">
                    <img
                        src={heroImage}
                        // Ya no es un fondo decorativo sino contenido: la foto es
                        // media página y muestra algo concreto, así que lleva alt real.
                        alt="La tribuna del Club Alianza con humo celeste durante un partido"
                        // Es el elemento LCP de la home: sin prioridad alta el
                        // navegador la encola como una imagen más y compite con las
                        // fotos de los eventos que están más abajo.
                        fetchPriority="high"
                        decoding="async"
                        className="size-full object-cover"
                    />
                    {/* Pie de foto: le da procedencia a la imagen y deja claro que es
                        del club y no de un banco de imágenes. */}
                    <span className="absolute bottom-0 left-0 bg-ink/80 px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                        Estadio Álvaro Pedro Ducós
                    </span>
                </div>
            </section>

            {/* -------------------------------------------------------- Destacados */}
            {/* Cada ficha es un bloque de celeste bajo con la regla de marca arriba:
                la regla sigue siendo el ancla, pero ahora se apoya sobre superficie
                propia en vez de flotar sobre el papel. El radio va solo abajo, para
                que el corte recto de arriba lea como continuación de la regla y no
                como una tarjeta que empieza redondeada.

                Sigue sin sombra: la profundidad es ambiental en este sistema y la
                jerarquía la hacen el color y el aire, no la elevación.

                La altura de la sección (py-28) y el relleno de las fichas (p-8)
                salen de dos sesiones de live mode con las perillas en 7 y 2. */}
            <section className="mx-auto max-w-7xl px-6 py-28">
                <div className="grid gap-12 md:grid-cols-3">
                    {HIGHLIGHTS.map(({ title, description }) => (
                        <div
                            key={title}
                            className="rounded-b-lg border-t-[3px] border-secondary bg-tertiary p-8"
                        >
                            <h3 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-balance text-ink">
                                {title}
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ------------------------------------------------------------ Agenda */}
            <section className="bg-tertiary py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <p className="kicker text-brand">Agenda · Próximos</p>
                            <h2 className="text-display mt-3 text-4xl text-ink">No te pierdas nada</h2>
                            <p className="mt-3 max-w-md text-muted-foreground">
                                Partidos, torneos, asambleas y eventos sociales. Todo en un solo lugar.
                            </p>
                        </div>
                        <Button asChild variant="dark">
                            <Link to="/eventos">
                                Ver agenda completa <ArrowRight />
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-2">
                        {isLoading &&
                            Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-[132px] rounded-xl" />
                            ))}

                        {!isLoading &&
                            events.map((event) => <EventCard key={event.id} event={event} />)}
                    </div>

                    {isError && (
                        <p className="mt-10 rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                            No pudimos cargar la agenda. Probá recargar la página en unos minutos.
                        </p>
                    )}

                    {!isLoading && !isError && events.length === 0 && (
                        <p className="mt-10 rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                            Todavía no hay eventos publicados. Volvé a visitarnos pronto.
                        </p>
                    )}
                </div>
            </section>

            {/* --------------------------------------------------------------- CTA */}
            {/* Espejo del hero: acá la foto va a la izquierda y el panel a la
                derecha. Reemplaza la caja de gradiente con esquinas redondeadas y de
                paso pone en uso cancha.webp, que estaba en assets sin usarse en
                ningún lado. */}
            <section className="grid bg-ink text-white lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                <div className="max-lg:aspect-[16/10]">
                    <img
                        src={canchaImage}
                        alt="La cancha del Club Alianza vacía, vista desde la tribuna"
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                    />
                </div>

                <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-12 xl:px-16">
                    <p className="kicker text-secondary">Asociate</p>

                    <h2 className="text-display mt-4 text-3xl leading-tight text-white lg:text-4xl">
                        ¿Querés ser parte de esta familia?
                    </h2>

                    <p className="mt-4 leading-relaxed text-white/70">
                        Ser socio es más que pagar una cuota: es sostener el club que representa a
                        Cutral Có y vivir cada partido desde adentro, con los mismos colores de
                        siempre.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild variant="hero" size="lg">
                            <Link to="/asociarse">Quiero asociarme</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            <Link to="/historia">Conocer el club</Link>
                        </Button>
                    </div>

                    {/* Sin el puntito de color delante de cada ítem: la regla de
                        arriba y el aire ya alcanzan para agruparlos. */}
                    <ul className="mt-10 grid gap-2.5 border-t border-white/15 pt-6 text-sm text-white/70">
                        {MEMBERSHIP_PERKS.map((perk) => (
                            <li key={perk}>{perk}</li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
