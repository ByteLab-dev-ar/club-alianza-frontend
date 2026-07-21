import { Eye, Target, Users } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import canchaImage from '@/assets/cancha.webp'
import { useBoard } from '../hooks/useBoard'

// Misión/visión/valores son copy institucional: no hay endpoint que los sirva,
// así que viven acá hasta que el club decida hacerlos editables.
const PILLARS = [
    {
        icon: Target,
        title: 'Misión',
        description:
            'Promover el deporte, la formación humana y la vida social como motores de comunidad.',
    },
    {
        icon: Eye,
        title: 'Visión',
        description:
            'Ser un club referente en gestión transparente, inclusión y crecimiento sostenible.',
    },
    {
        icon: Users,
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
                image={{ src: canchaImage, alt: 'Cancha del Club Alianza desde la tribuna' }}
            />

            <section className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {PILLARS.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="rounded-xl border bg-card p-8 shadow-soft">
                            <Icon className="size-7 text-secondary" strokeWidth={1.75} />
                            <h2 className="mt-5 font-display text-lg font-bold text-ink">{title}</h2>
                            <p className="mt-3 leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-20">
                <div className="bg-gradient-night rounded-2xl px-6 py-12 shadow-club sm:px-10">
                    <p className="kicker text-secondary">Comisión directiva</p>
                    {board?.period && (
                        <h2 className="text-display mt-3 text-3xl text-white">
                            Período {board.period}
                        </h2>
                    )}

                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {isLoading &&
                            Array.from({ length: 8 }).map((_, index) => (
                                <Skeleton key={index} className="h-24 rounded-xl bg-white/10" />
                            ))}

                        {!isLoading &&
                            members.map((member) => (
                                <div
                                    key={member.id}
                                    className="rounded-r-xl border border-l-2 border-white/10 border-l-secondary bg-white/5 p-5"
                                >
                                    <p className="kicker text-secondary">{member.position}</p>
                                    <p className="mt-2 font-display text-lg font-bold text-white">
                                        {member.fullName}
                                    </p>
                                </div>
                            ))}
                    </div>

                    {isError && (
                        <p className="rounded-xl border border-dashed border-white/20 p-12 text-center text-sm text-white/60">
                            No pudimos cargar la comisión directiva. Probá recargar en unos minutos.
                        </p>
                    )}

                    {!isLoading && !isError && members.length === 0 && (
                        <p className="rounded-xl border border-dashed border-white/20 p-12 text-center text-sm text-white/60">
                            Todavía no se cargó la comisión directiva.
                        </p>
                    )}
                </div>
            </section>
        </>
    )
}
