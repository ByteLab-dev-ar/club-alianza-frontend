import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { CategoryFilter } from '@/components/custom/CategoryFilter'
import { Pagination } from '@/components/custom/Pagination'
import { EventPosterCard } from '../components/EventPosterCard'
import { useEvents } from '../hooks/useEvents'
import { useEventCategories } from '../hooks/useEventCategories'

const PAGE_SIZE = 9

export const EventsPage = () => {
    const [categoryId, setCategoryId] = useState<string | undefined>()
    const [page, setPage] = useState(1)

    const { data: categories = [] } = useEventCategories()
    const { data, isLoading, isError, isPlaceholderData } = useEvents({
        page,
        limit: PAGE_SIZE,
        categoryId,
    })

    const events = data?.items ?? []
    const meta = data?.meta

    const selectCategory = (nextCategoryId?: string) => {
        setCategoryId(nextCategoryId)
        // Al cambiar el filtro la paginación anterior deja de tener sentido.
        setPage(1)
    }

    return (
        <>
            <PageHero
                kicker="Calendario"
                title="Agenda celeste"
                description="Toda la actividad del club: partidos, torneos, asambleas y eventos sociales."
            />

            <section className="mx-auto max-w-7xl px-6 py-12">
                {categories.length > 0 && (
                    <CategoryFilter
                        categories={categories}
                        selectedId={categoryId}
                        onSelect={selectCategory}
                    />
                )}

                <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading &&
                        Array.from({ length: 6 }).map((_, index) => (
                            // El alto sale de la proporción y no de un px fijo: la
                            // tarjeta es un póster 4:5 más el pie, así que el hueco
                            // tiene que escalar con el ancho de la columna.
                            <Skeleton key={index} className="aspect-[4/5] rounded-xl" />
                        ))}

                    {!isLoading &&
                        events.map((event) => <EventPosterCard key={event.id} event={event} />)}
                </div>

                {isError && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar la agenda. Probá recargar la página en unos minutos.
                    </p>
                )}

                {!isLoading && !isError && events.length === 0 && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        {categoryId
                            ? 'No hay eventos en esta categoría.'
                            : 'Todavía no hay eventos publicados. Volvé a visitarnos pronto.'}
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
            </section>
        </>
    )
}
