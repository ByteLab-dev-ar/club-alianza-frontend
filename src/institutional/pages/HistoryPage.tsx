import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { useHistory } from '../hooks/useHistory'

export const HistoryPage = () => {
    const { data: milestones = [], isLoading, isError } = useHistory()

    return (
        <>
            <PageHero
                kicker="12 · Oct · 1944"
                title="Una historia escrita en celeste"
                description="Más de ocho décadas de partidos, generaciones y emociones compartidas. Esta es nuestra línea de tiempo."
            />

            <section className="mx-auto max-w-3xl px-6 py-16">
                {isLoading && (
                    <div className="flex flex-col gap-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-28 rounded-xl" />
                        ))}
                    </div>
                )}

                {isError && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar la historia del club. Probá recargar en unos minutos.
                    </p>
                )}

                {!isLoading && !isError && milestones.length === 0 && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        Todavía no hay hitos cargados.
                    </p>
                )}

                {/* La línea vertical vive en el contenedor; cada hito aporta su punto. */}
                <ol className="relative border-l-2 border-border">
                    {milestones.map((milestone) => (
                        <li key={milestone.id} className="relative pb-12 pl-8 last:pb-0">
                            <span
                                aria-hidden
                                className="absolute -left-[9px] top-1.5 size-4 rounded-full border-4 border-background bg-secondary"
                            />
                            <p className="text-display text-2xl text-secondary">{milestone.year}</p>
                            <h2 className="mt-1 font-display text-lg font-bold text-ink">
                                {milestone.title}
                            </h2>
                            <p className="mt-2 leading-relaxed text-muted-foreground">
                                {milestone.description}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>
        </>
    )
}
