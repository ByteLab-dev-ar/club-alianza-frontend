import { Link } from 'react-router'
import { ArrowRight, CalendarDays, Sparkles, Trophy, Users } from 'lucide-react'

import heroImage from '@/assets/hero.png'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventCard } from '@/events/components/EventCard'
import { useEvents } from '@/events/hooks/useEvents'

const FOUNDING_YEAR = 1944

// Cifras de marketing: no salen del backend (el dashboard con números reales es
// privado del admin). Viven acá como copy editable hasta que exista un endpoint público.
const CLUB_STATS = [
    { value: `${new Date().getFullYear() - FOUNDING_YEAR}`, label: 'Años de historia' },
    { value: '+3.500', label: 'Socios activos' },
    { value: '47', label: 'Títulos ganados' },
]

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

const MEMBERSHIP_PERKS = [
    'Credencial digital con QR',
    'Acceso al portal del socio',
    'Beneficios en comercios adheridos',
    'Vos elegís cómo pagar la cuota',
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
                    className="absolute inset-0 -z-10 size-full object-cover opacity-45"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-ink/80 to-transparent"
                />

                <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-secondary">
                        <Sparkles className="size-3.5" />
                        <span className="kicker">Temporada {new Date().getFullYear()} en marcha</span>
                    </span>

                    <h1 className="text-display mt-8 max-w-3xl text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                        Pasión <span className="text-secondary">celeste</span>
                        <br />
                        desde <span className="text-secondary">{FOUNDING_YEAR}</span>
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

                    <dl className="mt-20 flex flex-wrap gap-x-16 gap-y-8">
                        {CLUB_STATS.map(({ value, label }) => (
                            <div key={label}>
                                <dt className="text-display text-4xl text-secondary">{value}</dt>
                                <dd className="kicker mt-2 text-white/50">{label}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* -------------------------------------------------------- Destacados */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid gap-6 md:grid-cols-3">
                    {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="rounded-xl border bg-card p-8 shadow-soft">
                            <span className="grid size-12 place-items-center rounded-lg bg-accent text-secondary">
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
                            <p className="kicker text-secondary">Agenda · Próximos</p>
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
                <div className="grid items-center gap-12 rounded-2xl bg-gradient-dark p-10 shadow-club lg:grid-cols-[1.5fr_1fr] lg:p-16">
                    <div>
                        <p className="kicker text-secondary">Asociate · {new Date().getFullYear()}</p>
                        <h2 className="text-display mt-3 text-4xl text-white">
                            Sumate al sentimiento celeste
                        </h2>
                        <p className="mt-4 max-w-lg leading-relaxed text-white/70">
                            Acceso a partidos como local, descuentos en eventos sociales, escuela de
                            fútbol y mucho más. Hacete socio en menos de 3 minutos.
                        </p>

                        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                            {MEMBERSHIP_PERKS.map((perk) => (
                                <li key={perk} className="flex items-center gap-2.5 text-sm text-white/80">
                                    <span className="size-1.5 shrink-0 rounded-full bg-secondary" />
                                    {perk}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10 flex flex-wrap gap-3">
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
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                        <p className="kicker text-white/50">Cuota mensual</p>
                        <p className="text-display mt-4 text-5xl text-secondary">$ 8.500</p>
                        <p className="mt-4 text-sm text-white/60">menores y veteranos bonificados</p>
                    </div>
                </div>
            </section>
        </>
    )
}
