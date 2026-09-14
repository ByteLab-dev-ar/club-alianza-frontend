import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import heroImage from '@/assets/hero.webp'
import { Skeleton } from '@/components/ui/skeleton'
import { CLUB_CONTACT } from '@/constants/club'
import { useBoard } from '../hooks/useBoard'
import { useHistory } from '../hooks/useHistory'
import { initialsOf } from '../lib/initials'

// Misión/visión/valores son copy institucional: no hay endpoint que los sirva,
// así que viven acá hasta que el club decida hacerlos editables.
const MISSION = 'Promover el deporte, la formación humana y la vida social como motores de comunidad.'
const VISION = 'Ser un club referente en gestión transparente, inclusión y crecimiento sostenible.'
const VALUES = ['Pertenencia', 'Esfuerzo colectivo', 'Juego limpio', 'Respeto por la historia']

/** Cuántos hitos adelanta la página. El recorrido entero vive en /historia. */
const MILESTONES_PREVIEW = 4

/**
 * El rótulo de un dato: el cargo, "Misión", "Dirección". No es un kicker
 * encima de un titular, es el nombre del campo que viene abajo.
 */
const LABEL = 'block font-display text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase'

const PIECE = 'rounded-xl border bg-card p-6 shadow-soft sm:p-7'

/**
 * La página institucional como tablero de piezas, igual que la portada.
 *
 * Reemplazó a una columna de tres bloques —encabezado, pilares con regla
 * celeste y la comisión en un panel oscuro— que se leía vacía: mucho aire y
 * poco club. Acá cada pieza contesta una pregunta del visitante (qué los guía,
 * quién conduce, dónde queda, de dónde viene) y la historia y la sede, que el
 * sitio ya tenía, suman contenido real en vez de relleno.
 */
export const InstitutionalPage = () => {
    const board = useBoard()
    const history = useHistory()

    const members = board.data?.members ?? []
    // El endpoint ordena por año ascendente: los últimos son los más recientes,
    // y se dejan en ese orden para que la fila se lea de izquierda a derecha.
    const milestones = (history.data ?? []).slice(-MILESTONES_PREVIEW)

    return (
        <section className="mx-auto max-w-7xl px-6 pt-8 pb-24">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
                {/*
                 * La foto con el título sobre una placa sólida, como la pieza
                 * grande de la portada. El alto sale de la proporción y no de un
                 * mínimo fijo: con un mínimo, la pieza de al lado se estiraba y
                 * quedaba medio vacía.
                 *
                 * En el teléfono la placa baja y va DEBAJO de la foto: a 375 px
                 * el título y la bajada tapaban dos tercios de la tribuna.
                 */}
                <div className="overflow-hidden rounded-xl bg-ink sm:relative sm:aspect-[16/10]">
                    <img
                        src={heroImage}
                        alt="La tribuna del Club Alianza con humo celeste durante un partido"
                        // Es el elemento LCP de esta página.
                        fetchPriority="high"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover sm:absolute sm:inset-0 sm:aspect-auto sm:size-full"
                    />
                    <div className="bg-ink/80 px-6 py-5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:px-7 sm:py-6">
                        <h1 className="text-display text-3xl text-balance text-white lg:text-4xl">
                            Cómo somos por dentro
                        </h1>
                        <p className="mt-2 max-w-[52ch] leading-relaxed text-white/70">
                            Una entidad civil sin fines de lucro, sostenida íntegramente por sus
                            socios y su comunidad.
                        </p>
                    </div>
                </div>

                <section
                    aria-labelledby="guia"
                    className="flex flex-col rounded-xl border bg-tertiary p-6 sm:p-7"
                >
                    <h2 id="guia" className="font-display text-lg font-extrabold tracking-tight text-ink">
                        Qué nos guía
                    </h2>

                    <div className="mt-4 divide-y">
                        <div className="pb-4">
                            <h3 className={LABEL}>Misión</h3>
                            <p className="mt-1.5 leading-relaxed text-foreground">{MISSION}</p>
                        </div>
                        <div className="py-4">
                            <h3 className={LABEL}>Visión</h3>
                            <p className="mt-1.5 leading-relaxed text-foreground">{VISION}</p>
                        </div>
                        <div className="pt-4">
                            <h3 className={LABEL}>Valores</h3>
                            {/* Los valores son una lista de palabras, no una oración:
                                como etiquetas se leen de un vistazo. */}
                            <ul className="mt-2.5 flex flex-wrap gap-2">
                                {VALUES.map((value) => (
                                    <li
                                        key={value}
                                        className="rounded-sm bg-card px-3 py-1.5 text-sm font-semibold text-ink"
                                    >
                                        {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
                <section aria-labelledby="comision" className={PIECE}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <h2
                            id="comision"
                            className="font-display text-lg font-extrabold tracking-tight text-ink"
                        >
                            Comisión directiva
                        </h2>
                        {board.data?.period && (
                            <span className="text-sm text-muted-foreground">
                                Período {board.data.period}
                            </span>
                        )}
                    </div>

                    {board.isLoading && (
                        <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Skeleton key={index} className="h-12 rounded-lg" />
                            ))}
                        </div>
                    )}

                    {/*
                     * El cargo va TAL COMO LLEGA: es texto libre que carga el club,
                     * en el orden de `displayOrder`. Nada de agrupar en "mesa" y
                     * "vocales", ni de reordenar, ni de pasarlo a femenino: todo
                     * eso se rompe el día que alguien cargue un cargo que no
                     * estaba previsto.
                     */}
                    {members.length > 0 && (
                        <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
                            {members.map((member) => (
                                <li
                                    key={member.id}
                                    className="flex items-center gap-3 border-t py-3.5 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
                                >
                                    <span
                                        aria-hidden
                                        className="grid size-10 shrink-0 place-items-center rounded-full bg-muted font-display text-sm font-extrabold text-ink"
                                    >
                                        {initialsOf(member.fullName)}
                                    </span>
                                    <div className="min-w-0">
                                        <span className={LABEL}>{member.position}</span>
                                        <span className="mt-0.5 block truncate font-semibold text-ink">
                                            {member.fullName}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {board.isError && (
                        <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No pudimos cargar la comisión directiva. Probá recargar en unos minutos.
                        </p>
                    )}

                    {!board.isLoading && !board.isError && members.length === 0 && (
                        <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            Todavía no se cargó la comisión directiva.
                        </p>
                    )}
                </section>

                {/* Mismos datos que el pie y que Contacto, de la misma fuente. El
                    enlace va abajo de todo con `mt-auto`: la pieza se estira al
                    alto de la comisión y así el aire queda en el medio y no
                    colgando al final. */}
                <section aria-labelledby="sede" className={`${PIECE} flex flex-col`}>
                    <h2 id="sede" className="font-display text-lg font-extrabold tracking-tight text-ink">
                        La sede
                    </h2>

                    <dl className="mt-4 grid gap-3 text-sm">
                        <div>
                            <dt className={LABEL}>Dirección</dt>
                            <dd className="mt-0.5 text-ink">{CLUB_CONTACT.address}</dd>
                        </div>
                        <div>
                            <dt className={LABEL}>Teléfono</dt>
                            <dd className="mt-0.5">
                                <a href={`tel:${CLUB_CONTACT.phoneHref}`} className="text-ink hover:text-brand">
                                    {CLUB_CONTACT.phone}
                                </a>
                            </dd>
                        </div>
                        <div>
                            <dt className={LABEL}>Correo</dt>
                            <dd className="mt-0.5 break-all">
                                <a href={`mailto:${CLUB_CONTACT.email}`} className="text-ink hover:text-brand">
                                    {CLUB_CONTACT.email}
                                </a>
                            </dd>
                        </div>
                    </dl>

                    <Link
                        to="/contacto"
                        className="group mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand hover:text-ink"
                    >
                        Cómo llegar
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </section>
            </div>

            {/* Un adelanto, no la línea de tiempo: si el club no cargó hitos, la
                pieza no aparece, porque una caja vacía es justo lo que hacía que
                la página se viera vacía. */}
            {(history.isLoading || history.isError || milestones.length > 0) && (
                <section aria-labelledby="historia" className={`${PIECE} mt-5`}>
                    <div className="flex items-baseline justify-between gap-3">
                        <h2
                            id="historia"
                            className="font-display text-lg font-extrabold tracking-tight text-ink"
                        >
                            Historia
                        </h2>
                        <Link
                            to="/historia"
                            className="group flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-ink"
                        >
                            Toda la historia
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {history.isLoading && (
                        <div className="mt-4 grid grid-cols-2 gap-5 lg:grid-cols-4">
                            {Array.from({ length: MILESTONES_PREVIEW }).map((_, index) => (
                                <Skeleton key={index} className="h-16 rounded-lg" />
                            ))}
                        </div>
                    )}

                    {milestones.length > 0 && (
                        <ol className="mt-4 grid grid-cols-2 gap-5 lg:grid-cols-4">
                            {milestones.map((milestone) => (
                                <li key={milestone.id} className="border-t pt-3.5">
                                    <span className="block font-display text-lg font-extrabold text-ink tabular-nums">
                                        {milestone.year}
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 block text-foreground">
                                        {milestone.title}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}

                    {history.isError && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            No pudimos cargar la historia. Probá recargar en unos minutos.
                        </p>
                    )}
                </section>
            )}
        </section>
    )
}
