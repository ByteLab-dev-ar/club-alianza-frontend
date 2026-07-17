import type { ReactNode } from 'react'

interface Props {
    kicker: string
    title: ReactNode
    description?: string
}

/** Encabezado que abre todas las páginas internas del sitio público. */
export const PageHero = ({ kicker, title, description }: Props) => {
    return (
        <section className="border-b bg-tertiary">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
                <p className="kicker text-secondary">{kicker}</p>
                <h1 className="text-display mt-3 text-4xl text-ink lg:text-5xl">{title}</h1>
                {description && (
                    <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </section>
    )
}
