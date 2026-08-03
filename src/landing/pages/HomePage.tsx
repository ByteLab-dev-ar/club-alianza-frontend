import { Link } from 'react-router'
import { ArrowRight, CalendarDays, Sparkles, Trophy, Users } from 'lucide-react'

import heroImage from '@/assets/hero.webp'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCard } from '@/events/components/EventCard'
import { useEvents } from '@/events/hooks/useEvents'

const HIGHLIGHTS = [
    {
        icon: Trophy,
        title: 'Deporte de alto nivel',
        description: 'Primera división regional y categorías inferiores desde los 6 años.',
    },
    {
        icon: Users,
        title: 'Comunidad activa',
        description: 'Asados, peñas y actividades sociales todo el año.',
    },
    {
        icon: CalendarDays,
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
            <section className="relative isolate overflow-hidden bg-ink">
                <img
                    src={heroImage}
                    alt=""
                    aria-hidden
                    // Es el elemento LCP de la home: sin prioridad alta el
                    // navegador la encola como una imagen más y compite con las
                    // fotos de los eventos que están más abajo.
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 -z-10 size-full object-cover opacity-90"
                />
                {/* El velo se mantiene más denso arriba a la izquierda —donde va el
                    titular y el texto en blanco— y se abre hacia la derecha para que
                    se vea la foto. Medido sobre esta imagen: en el punto más claro el
                    titular queda en 5.2:1 y el cuerpo en 6.6:1 (WCAG AA pide 4.5:1),
                    así que no conviene aclararlo más sin volver a medir. */}
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-br from-ink/75 via-ink/45 to-ink/10"
                />

                <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-secondary">
                        <Sparkles className="size-3.5" />
                        <span className="kicker">Temporada {new Date().getFullYear()} en marcha</span>
                    </span>

                    <h1 className="text-display mt-8 max-w-3xl text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                        Pasión <span className="text-secondary">celeste</span>
                        <br />
                        en <span className="text-secondary">Cutral Có</span>
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                        Somos más que un club: somos comunidad, historia y futuro. Sumate al
                        sentimiento que se vive cancha adentro y afuera.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-3">
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
            </section>

            {/* -------------------------------------------------------- Destacados */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid gap-6 md:grid-cols-3">
                    {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="rounded-xl border bg-card p-8 shadow-soft">
                            <span className="grid size-12 place-items-center rounded-lg bg-accent text-brand">
                                <Icon className="size-6" />
                            </span>
                            <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
            <section className="mx-auto max-w-7xl px-6 py-24">
                <div className="bg-gradient-night rounded-2xl px-6 py-16 text-center shadow-club sm:px-10 lg:py-20">
                    <p className="kicker text-secondary">Asociate</p>
                    <h2 className="text-display mx-auto mt-4 max-w-2xl text-4xl leading-tight text-white lg:text-5xl">
                        ¿Querés ser parte de esta familia?
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/70">
                        Ser socio es más que pagar una cuota: es sostener el club que representa a
                        Cutral Có y vivir cada partido desde adentro, con los mismos colores de
                        siempre.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
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

                    <ul className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-x-8 gap-y-3 border-t border-white/10 pt-8">
                        {MEMBERSHIP_PERKS.map((perk) => (
                            <li
                                key={perk}
                                className="flex items-center gap-2.5 text-sm text-white/70"
                            >
                                <span className="size-1.5 shrink-0 rounded-full bg-secondary" />
                                {perk}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
