import { PageHero } from '@/components/custom/PageHero'
import { useHistory } from '../hooks/useHistory'
import { MilestoneItem, MilestoneSkeleton } from '../components/MilestoneItem'

export const HistoryPage = () => {
    const { data: milestones = [], isLoading, isError } = useHistory()

    const hasMilestones = !isLoading && !isError && milestones.length > 0

    return (
        <>
            <PageHero
                kicker="Nuestra historia"
                title="Una historia escrita en celeste"
                description="Partidos, generaciones y emociones compartidas. Esta es nuestra línea de tiempo."
            />

            <section className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
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

                {(isLoading || hasMilestones) && (
                    <ol className="timeline-track relative">
                        {/* Dos capas: el riel gris de fondo marca el recorrido completo
                            y la barra celeste encima lo va llenando con el scroll.
                            El centrado va por margen y no por translate, porque la
                            barra usa transform para su propia animación. */}
                        <span
                            aria-hidden
                            className="absolute top-0 left-6 -ml-px h-full w-0.5 bg-border lg:left-1/2"
                        />
                        <span
                            aria-hidden
                            className="timeline-fill absolute top-0 left-6 -ml-px h-full w-0.5 bg-secondary lg:left-1/2"
                        />

                        {isLoading &&
                            Array.from({ length: 4 }).map((_, index) => (
                                <MilestoneSkeleton key={index} />
                            ))}

                        {hasMilestones &&
                            milestones.map((milestone, index) => (
                                <MilestoneItem
                                    key={milestone.id}
                                    milestone={milestone}
                                    index={index}
                                />
                            ))}
                    </ol>
                )}
            </section>
        </>
    )
}
