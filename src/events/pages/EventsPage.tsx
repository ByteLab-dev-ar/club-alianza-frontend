import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { CategoryFilter } from '@/components/custom/CategoryFilter'
import { EventCard } from '../components/EventCard'
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
                            <Skeleton key={index} className="h-[132px] rounded-xl" />
                        ))}

                    {!isLoading &&
                        events.map((event) => <EventCard key={event.id} event={event} />)}
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

                {meta && meta.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            disabled={page <= 1 || isPlaceholderData}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {meta.currentPage} de {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={page >= meta.totalPages || isPlaceholderData}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </section>
        </>
    )
}
