import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { CategoryFilter } from '@/components/custom/CategoryFilter'
import { Pagination } from '@/components/custom/Pagination'
import { todayIso } from '@/lib/format'
import { EventPosterCard } from '../components/EventPosterCard'
import { NextEventBand } from '../components/NextEventBand'
import { PastEventRow } from '../components/PastEventRow'
import { groupEventsByMonth, monthLabel } from '../lib/agenda-months'
import { usePastEvents, useUpcomingEvents } from '../hooks/useEvents'
import { useEventCategories } from '../hooks/useEventCategories'

const PAGE_SIZE = 9

/** Los pasados son renglones y no pósters: entran muchos más sin cansar. */
const PAST_PAGE_SIZE = 8

/**
 * La agenda, partida en lo que viene y lo que ya pasó.
 *
 * Antes era un solo listado que empezaba por el evento más viejo publicado por
 * el club —`GET /events` ordena ascendente y el front no mandaba fecha—, así
 * que había que paginar hasta el final para enterarse de lo que viene. Ahora la
 * página abre por el próximo y lo viejo queda abajo, de lo más reciente para
 * atrás.
 */
export const EventsPage = () => {
    const [categoryId, setCategoryId] = useState<string | undefined>()
    const [page, setPage] = useState(1)
    const [pastPage, setPastPage] = useState(1)

    const { data: categories = [] } = useEventCategories()
    const { data, isLoading, isError, isPlaceholderData } = useUpcomingEvents({
        page,
        limit: PAGE_SIZE,
        categoryId,
    })
    const past = usePastEvents({ page: pastPage, limit: PAST_PAGE_SIZE, categoryId })

    const events = data?.items ?? []
    const meta = data?.meta
    const pastEvents = past.data?.items ?? []
    const pastMeta = past.data?.meta
    const pastTotal = pastMeta?.totalItems ?? 0

    /*
     * La página de pasados pedida, pero nunca una que no existe. Pasa de
     * verdad: alguien está en la tercera pantalla de pasados y el club borra
     * eventos viejos. Sin esto queda una caja vacía y sin salida, porque la
     * paginación se esconde sola cuando hay una sola página y ya no hay botón
     * para volver.
     *
     * Solo con datos propios y no con los de relleno (`keepPreviousData`): el
     * total de relleno es el de la página o la categoría anterior, y con ese
     * total la cuenta mandaría a una página que no es.
     */
    const lastPastPage = Math.max(1, pastMeta?.totalPages ?? 1)
    if (pastMeta && !past.isPlaceholderData && pastPage > lastPastPage) {
        setPastPage(lastPastPage)
    }

    /*
     * El primero de la primera página es el próximo: se va a la franja y no se
     * repite abajo. En la página 2 ya no hay próximo que destacar. Que sea el
     * de la hora más temprana cuando hay dos el mismo día lo garantiza el
     * desempate del servidor, no una cuenta de acá.
     *
     * La cuenta mira el `currentPage` de los DATOS y no el estado de la
     * página. Mientras llega la página nueva se sigue mostrando la anterior
     * (`keepPreviousData`), y con el estado se veía el peor de los dos mundos:
     * la franja desaparecía y el evento que estaba en ella aparecía duplicado
     * abajo hasta que llegaba la respuesta.
     */
    const onFirstPage = meta?.currentPage === 1
    const [next, ...rest] = onFirstPage ? events : []
    const months = groupEventsByMonth(onFirstPage ? rest : events)
    const today = todayIso()

    const selectCategory = (nextCategoryId?: string) => {
        setCategoryId(nextCategoryId)
        // Al cambiar el filtro la paginación anterior deja de tener sentido.
        setPage(1)
        setPastPage(1)
    }

    return (
        <>
            <PageHero
                kicker="Calendario"
                title="Agenda celeste"
                description="Toda la actividad del club: partidos, torneos, asambleas y eventos sociales."
            />

            <section className="mx-auto max-w-7xl px-6 pt-12">
                {categories.length > 0 && (
                    <CategoryFilter
                        categories={categories}
                        selectedId={categoryId}
                        onSelect={selectCategory}
                    />
                )}

                <div className="mt-8 flex items-baseline justify-between gap-4 border-b-2 border-ink pb-4">
                    <h2 className="text-display text-2xl text-ink">Lo que viene</h2>
                    {meta && (
                        <span className="text-sm text-muted-foreground">
                            {meta.totalItems === 1 ? '1 evento' : `${meta.totalItems} eventos`}
                        </span>
                    )}
                </div>
            </section>

            {/* La franja va FUERA del contenedor: es una sección a sangre, y
                dentro del max-w-7xl dejaría de serlo. El aire de arriba lo pone
                la página y no el componente: pegada al filete de 2 px del
                encabezado, que también es negro, la franja se lo comía y el
                filete parecía su borde superior. */}
            {next && (
                <div className="mt-8">
                    <NextEventBand event={next} />
                </div>
            )}

            <section className="mx-auto max-w-7xl px-6 pb-20">
                {isLoading && (
                    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            // El alto sale de la proporción y no de un px fijo: la
                            // tarjeta es un póster 4:5 más el pie, así que el hueco
                            // tiene que escalar con el ancho de la columna.
                            <Skeleton key={index} className="aspect-[4/5] rounded-xl" />
                        ))}
                    </div>
                )}

                {months.map((group) => (
                    <div key={group.month}>
                        {/* El rótulo de mes es lo que convierte una grilla en una
                            agenda: sin él, doce tarjetas seguidas no dicen dónde
                            termina septiembre y empieza octubre. */}
                        <div className="mt-10 mb-5 flex items-center gap-4">
                            <h3 className="font-display text-lg font-extrabold tracking-tight text-ink capitalize">
                                {monthLabel(group.month, today)}
                            </h3>
                            <span className="h-px flex-1 bg-border" />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {group.events.map((event) => (
                                <EventPosterCard key={event.id} event={event} />
                            ))}
                        </div>
                    </div>
                ))}

                {isError && (
                    <p className="mt-8 rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar la agenda. Probá recargar la página en unos minutos.
                    </p>
                )}

                {/* "No hay nada agendado" sería mentira desde que la página
                    filtra por fecha: puede haber cien eventos publicados y
                    ninguno próximo. El vacío habla del futuro, y si hay
                    historial lo dice, porque está acá abajo. */}
                {!isLoading && !isError && events.length === 0 && (
                    <p className="mt-8 rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        {categoryId
                            ? 'Por ahora no hay eventos próximos en esta categoría.'
                            : 'Por ahora no hay eventos próximos.'}
                        {pastTotal > 0 && ' Abajo está todo lo que ya pasó.'}
                    </p>
                )}

                {meta && (
                    <div className="mt-12">
                        <Pagination
                            meta={meta}
                            onPageChange={setPage}
                            disabled={isPlaceholderData}
                            align="center"
                        />
                    </div>
                )}

                {/* Los pasados solo aparecen si los hay: un club recién
                    estrenado no tiene por qué mostrar una caja vacía. El error
                    también abre la sección, porque si falla el pedido el total
                    queda en cero y el aviso de abajo no se dibujaba nunca: la
                    sección entera desaparecía sin decir por qué. */}
                {(pastTotal > 0 || past.isError) && (
                    <div className="mt-20">
                        <div className="flex items-baseline justify-between gap-4 border-b pb-4">
                            <h2 className="text-display text-2xl text-muted-foreground">
                                Ya pasaron
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                Lo más reciente primero
                            </span>
                        </div>

                        {past.isError ? (
                            <p className="mt-5 rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                                No pudimos cargar los eventos anteriores.
                            </p>
                        ) : (
                            // Sin esqueleto propio: la sección recién se dibuja
                            // cuando llegó el total, y al cambiar de página o de
                            // categoría queda la lista anterior en pantalla
                            // (`keepPreviousData`) hasta que llega la nueva.
                            <div className="mt-5 overflow-hidden rounded-xl border bg-card">
                                {pastEvents.map((event) => (
                                    <PastEventRow key={event.id} event={event} />
                                ))}
                            </div>
                        )}

                        {pastMeta && (
                            <div className="mt-8">
                                <Pagination
                                    meta={pastMeta}
                                    onPageChange={setPastPage}
                                    // `isPlaceholderData` y no `isFetching`: el
                                    // segundo se prende también cuando TanStack
                                    // revalida sola al volver a la pestaña, y
                                    // apagaba los botones con la lista entera en
                                    // pantalla.
                                    disabled={past.isPlaceholderData}
                                    align="center"
                                />
                            </div>
                        )}
                    </div>
                )}
            </section>
        </>
    )
}
