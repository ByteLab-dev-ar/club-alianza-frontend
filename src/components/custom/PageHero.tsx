import type { ReactNode } from 'react'

interface Props {
    kicker: string
    title: ReactNode
    description?: string
    /**
     * Si se pasa una imagen, el encabezado se abre en dos columnas
     * (texto | foto). Sin imagen queda la banda de ancho completo de siempre.
     */
    image?: { src: string; alt: string }
}

/** Encabezado que abre las páginas internas del sitio público. */
export const PageHero = ({ kicker, title, description, image }: Props) => {
    const text = (
        <div>
            <p className="kicker text-brand">{kicker}</p>
            <h1 className="text-display mt-3 text-4xl text-ink lg:text-5xl">{title}</h1>
            {description && (
                <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    )

    if (!image) {
        return (
            <section className="border-b bg-tertiary">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">{text}</div>
            </section>
        )
    }

    return (
        <section className="border-b bg-tertiary">
            {/* La foto se lleva más ancho que el texto (6 contra 4): el titular es
                corto y no necesita la mitad del ancho. */}
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] lg:gap-14 lg:py-16">
                {text}
                {/* Sin lazy y con prioridad alta: el encabezado está siempre arriba
                    de todo, así que esta imagen suele ser el LCP de la página.
                    El 16/10 recorta cielo arriba y alambrado abajo (la foto original
                    es 4:3), y el encuadre desplazado al 45% saca un poco más de abajo. */}
                <img
                    src={image.src}
                    alt={image.alt}
                    className="aspect-[16/10] w-full rounded-2xl object-cover object-[center_45%] shadow-club"
                    fetchPriority="high"
                />
            </div>
        </section>
    )
}
