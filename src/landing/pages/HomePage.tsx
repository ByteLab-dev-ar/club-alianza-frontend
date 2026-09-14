import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import canchaImage from '@/assets/cancha.webp'
import heroImage from '@/assets/hero.webp'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventRow } from '@/events/components/EventRow'
import { useUpcomingEvents } from '@/events/hooks/useEvents'

/**
 * Qué le da el portal al socio. Es lo único que la portada puede AFIRMAR y
 * además demostrar, así que reemplazó a las tres fichas de "destacados" —cuyos
 * textos son los claims que PRODUCT.md tiene bloqueados— y a la lista de
 * beneficios que colgaba del pie del bloque de asociarse.
 */
const CUENTA = [
    { titulo: 'Tu credencial', detalle: 'El QR que escanean en la puerta.' },
    { titulo: 'Tu cuota', detalle: 'Hasta cuándo estás cubierto, y pagarla.' },
    { titulo: 'Tus comprobantes', detalle: 'Los recibos que emitió el club.' },
]

/**
 * Las tres coberturas, explicadas por lo que HABILITAN y no por su estado
 * administrativo (§5). Es la confusión más cara del producto —"pagué la cuota"
 * puede significar tres cosas— y la portada es donde conviene desarmarla, antes
 * de que alguien se asocie.
 */
const COBERTURAS = [
    {
        titulo: 'Membresía',
        quien: 'Todo socio',
        detalle: 'Es la única que bloquea el ingreso al club.',
    },
    {
        titulo: 'Actividad',
        quien: 'Solo quien entrena',
        detalle: 'Vencida, entrás igual a ver los partidos.',
    },
    {
        titulo: 'Seguro',
        quien: 'Opcional',
        detalle: 'Cobertura médica de la actividad. No bloquea nada.',
    },
]

const REQUISITOS = [
    'DNI, de los dos lados',
    'Una foto tuya, para la credencial',
    'La ficha de afiliación firmada — en pantalla, o en papel en la sede',
]

export const HomePage = () => {
    // Los próximos cuatro, de verdad: el hook filtra desde hoy. Sin ese filtro
    // esta lista mostraba los cuatro eventos MÁS VIEJOS que publicó el club,
    // porque el endpoint ordena ascendente y nunca se le mandaba fecha.
    const { data, isLoading, isError } = useUpcomingEvents({ limit: 4 })
    const events = data?.items ?? []

    return (
        <>
            {/*
             * Portada en mosaico, no hero de conversión.
             *
             * Es la forma que tienen las portadas de los clubes de verdad
             * (Racing, St. Pauli): contenido arriba —una pieza grande y dos
             * chicas, cada una con su rótulo de sección— y la agenda al lado.
             * "Asociarse" no ocupa la portada: vive en el menú y en su propia
             * sección, más abajo.
             *
             * Lo que NO se copió de ahí: fixture, tabla de posiciones y plantel.
             * Esos clubes los muestran porque tienen esos datos; acá no existen
             * y rellenarlos sería inventar.
             */}
            <section className="mx-auto max-w-7xl px-6 pt-8">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
                    {/* La pieza grande sostiene la identidad del club, que es lo
                        que la portada tiene que decir primero. El rótulo va sobre
                        una PLACA sólida y no sobre un velo de degradé: la foto se
                        muestra entera, que es la regla del sistema. */}
                    <div className="relative overflow-hidden rounded-xl bg-ink max-lg:aspect-[16/10] lg:min-h-[26rem]">
                        <img
                            src={heroImage}
                            alt="La tribuna del Club Alianza con humo celeste durante un partido"
                            // Es el elemento LCP de la home: sin prioridad alta el
                            // navegador la encola como una imagen más y compite con
                            // las fotos de los eventos que están más abajo.
                            fetchPriority="high"
                            decoding="async"
                            className="size-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-ink/80 px-6 py-5">
                            <p className="kicker text-secondary">El club</p>
                            <p className="text-display mt-2 text-2xl text-balance text-white sm:text-3xl">
                                Pasión celeste en Cutral Có
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
                                Estadio Álvaro Pedro Ducós
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:max-lg:grid-cols-2">
                        <Link
                            to="/historia"
                            className="group flex flex-col justify-between rounded-xl border bg-tertiary p-6 transition-colors hover:bg-accent"
                        >
                            <div>
                                <p className="kicker text-brand">Historia</p>
                                <h2 className="font-display mt-2 text-xl font-extrabold tracking-tight text-balance text-ink">
                                    Cómo nació el Alianza
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    El recorrido del club desde su fundación hasta hoy, contado
                                    por su gente.
                                </p>
                            </div>
                            <span className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-brand">
                                Ver la historia
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </Link>

                        {/* La segunda pieza lleva foto y no texto: son dos accesos
                            del mismo peso, y la galería se anuncia mejor con una
                            imagen. De paso pone en uso cancha.webp. */}
                        <Link
                            to="/galeria"
                            className="relative overflow-hidden rounded-xl bg-ink max-sm:aspect-[16/10] sm:max-lg:aspect-auto"
                        >
                            <img
                                src={canchaImage}
                                alt="La cancha del Club Alianza vista desde la tribuna"
                                loading="lazy"
                                decoding="async"
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-ink/80 px-6 py-4">
                                <p className="kicker text-secondary">Galería</p>
                                <p className="text-display mt-1.5 text-xl text-white">
                                    Las fotos del club
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/*
                 * El riel. Donde esos clubes ponen calendario y tabla, acá va lo
                 * único vivo que este producto tiene —la agenda, que sale del
                 * backend— y el acceso del que YA es socio. Esa tarjeta no es un
                 * argumento de venta: es una puerta, y por eso está acá arriba y
                 * no en la sección de asociarse.
                 */}
                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
                    <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                        <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
                            <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
                                Lo que viene
                            </h2>
                            <Link
                                to="/eventos"
                                className="text-sm font-semibold text-brand hover:text-ink"
                            >
                                Ver la agenda
                            </Link>
                        </div>

                        {isLoading && (
                            <div className="flex flex-col gap-3 p-5">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton key={index} className="h-16 rounded-lg" />
                                ))}
                            </div>
                        )}

                        {!isLoading &&
                            events.map((event) => <EventRow key={event.id} event={event} />)}

                        {isError && (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                No pudimos cargar la agenda. Probá recargar en unos minutos.
                            </p>
                        )}

                        {/* Habla del futuro, no del archivo: desde que la lista
                            filtra por fecha, "no hay eventos publicados" sería
                            falso con la agenda llena de eventos que ya pasaron. */}
                        {!isLoading && !isError && events.length === 0 && (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                Por ahora no hay eventos próximos. Mirá la agenda para ver lo que
                                ya pasó.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col rounded-xl border bg-card p-6 shadow-soft">
                        <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
                            Ya sos socio
                        </h2>

                        <ul className="mt-4 flex-1">
                            {CUENTA.map(({ titulo, detalle }) => (
                                <li key={titulo} className="border-t py-3 text-sm first:border-t-0">
                                    <span className="block font-semibold text-ink">{titulo}</span>
                                    <span className="text-muted-foreground">{detalle}</span>
                                </li>
                            ))}
                        </ul>

                        <Button asChild className="mt-5 w-full">
                            <Link to="/mi-cuenta">Entrar a mi cuenta</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/*
             * Hacete socio, en concreto.
             *
             * En los clubes reales esta página son precios, descuento familiar y
             * requisitos — no tres fichas de beneficios. Acá va lo mismo con lo
             * que este club tiene: las tres coberturas explicadas por lo que
             * habilitan, el descuento familiar y qué papeles hay que llevar.
             */}
            <section className="mt-18 bg-tertiary py-18">
                <div className="mx-auto max-w-7xl px-6">
                    <h2 className="text-display text-4xl text-ink">Hacete socio</h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                        La membresía es lo que te hace socio y lo que te deja entrar. La
                        actividad y el seguro son aparte, y solo los paga quien practica.
                    </p>

                    <dl className="mt-8 overflow-hidden rounded-xl border bg-card shadow-soft">
                        {COBERTURAS.map(({ titulo, quien, detalle }) => (
                            <div
                                key={titulo}
                                className="grid gap-1 border-t px-6 py-5 first:border-t-0 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
                            >
                                <dt className="font-semibold text-ink">{titulo}</dt>
                                <dd>
                                    <span className="block text-ink">{quien}</span>
                                    <span className="mt-0.5 block text-sm text-muted-foreground">
                                        {detalle}
                                    </span>
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {/* Los montos vigentes NO se muestran acá todavía: los tiene
                        el backend, pero solo los sirve `/admin/fees/current`, que
                        pide rol de gestión. Con un endpoint público de precios,
                        esta línea se reemplaza por una columna con el valor. */}
                    <p className="mt-3 text-sm text-muted-foreground">
                        Los valores vigentes te los pasamos al asociarte, o en la sede.
                    </p>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">
                                Grupo familiar
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Si en una casa hay varios socios, el club aplica un descuento
                                sobre las cuotas del grupo.
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Un tutor puede pagar la cuota de los chicos a cargo en una sola
                                operación.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card p-6">
                            <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">
                                Qué hace falta
                            </h3>
                            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                                {REQUISITOS.map((requisito) => (
                                    <li key={requisito}>{requisito}</li>
                                ))}
                            </ul>
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                <span className="font-semibold text-ink">Dónde te atienden:</span>{' '}
                                C. H. Rodríguez 26, Cutral Có
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Button asChild variant="hero" size="lg">
                            <Link to="/asociarse">
                                Asociarme en línea <ArrowRight />
                            </Link>
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            También podés acercarte a la sede y lo hacemos ahí.
                        </p>
                    </div>
                </div>
            </section>
        </>
    )
}
