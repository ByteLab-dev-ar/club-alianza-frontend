import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { useBoard } from '../hooks/useBoard'

// Misión/visión/valores son copy institucional: no hay endpoint que los sirva,
// así que viven acá hasta que el club decida hacerlos editables.
const PILLARS = [
    {
        title: 'Misión',
        description:
            'Promover el deporte, la formación humana y la vida social como motores de comunidad.',
    },
    {
        title: 'Visión',
        description:
            'Ser un club referente en gestión transparente, inclusión y crecimiento sostenible.',
    },
    {
        title: 'Valores',
        description: 'Pertenencia, esfuerzo colectivo, juego limpio y respeto por la historia.',
    },
]

export const InstitutionalPage = () => {
    const { data: board, isLoading, isError } = useBoard()

    const members = board?.members ?? []

    return (
        <>
            <PageHero
                kicker="Institucional"
                title="Cómo somos por dentro"
                description="Una entidad civil sin fines de lucro, sostenida íntegramente por sus socios y su comunidad."
            />

            <section className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {PILLARS.map(({ title, description }) => (
                        <div key={title} className="rounded-xl border bg-card p-8 shadow-soft">
                            <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
                            <p className="mt-3 leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-tertiary py-16">
                <div className="mx-auto max-w-7xl px-6">
                    <p className="kicker text-secondary">Comisión directiva</p>
                    {board?.period && (
                        <h2 className="text-display mt-3 text-3xl text-ink">
                            Período {board.period}
                        </h2>
                    )}

                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {isLoading &&
                            Array.from({ length: 8 }).map((_, index) => (
                                <Skeleton key={index} className="h-24 rounded-xl" />
                            ))}

                        {!isLoading &&
                            members.map((member) => (
                                <div
                                    key={member.id}
                                    className="rounded-xl border bg-card p-6 shadow-soft"
                                >
                                    <p className="kicker text-muted-foreground">
                                        {member.position}
                                    </p>
                                    <p className="mt-2 font-display text-lg font-bold text-ink">
                                        {member.fullName}
                                    </p>
                                </div>
                            ))}
                    </div>

                    {isError && (
                        <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                            No pudimos cargar la comisión directiva. Probá recargar en unos minutos.
                        </p>
                    )}

                    {!isLoading && !isError && members.length === 0 && (
                        <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                            Todavía no se cargó la comisión directiva.
                        </p>
                    )}
                </div>
            </section>
        </>
    )
}
