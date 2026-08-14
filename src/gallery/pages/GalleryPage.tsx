import { useState } from 'react'
import { Link } from 'react-router'
import { Images } from 'lucide-react'

import { formatCalendarDate } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHero } from '@/components/custom/PageHero'
import { CategoryFilter } from '@/components/custom/CategoryFilter'
import { Pagination } from '@/components/custom/Pagination'
import { useGallery, useGalleryCategories } from '../hooks/useGallery'

const PAGE_SIZE = 12

/**
 * Grilla de momentos: una tarjeta por momento, con su portada y cuántas fotos
 * tiene. Nunca una grilla de fotos sueltas — las fotos viven en el detalle, que
 * es la única pantalla que las pide.
 */
export const GalleryPage = () => {
    const [categoryId, setCategoryId] = useState<string | undefined>()
    const [page, setPage] = useState(1)

    const { data: categories = [] } = useGalleryCategories()
    const { data, isLoading, isError, isPlaceholderData } = useGallery({
        page,
        limit: PAGE_SIZE,
        categoryId,
    })

    const albums = data?.items ?? []
    const meta = data?.meta

    const selectCategory = (nextCategoryId?: string) => {
        setCategoryId(nextCategoryId)
        setPage(1)
    }

    return (
        <>
            <PageHero
                kicker="Galería"
                title="Momentos celestes"
                description="Partidos, festejos y vida social del club, contados en imágenes."
            />

            <section className="mx-auto max-w-7xl px-6 py-12">
                {categories.length > 0 && (
                    <CategoryFilter
                        categories={categories}
                        selectedId={categoryId}
                        onSelect={selectCategory}
                    />
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading &&
                        Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="aspect-4/3 rounded-xl" />
                        ))}

                    {!isLoading &&
                        albums.map((album) => (
                            <Link
                                key={album.id}
                                to={`/galeria/${album.id}`}
                                className="group relative aspect-4/3 overflow-hidden rounded-xl border bg-muted shadow-soft"
                            >
                                {album.coverUrl ? (
                                    <img
                                        // En desarrollo el seed sirve `data:image/svg+xml`
                                        // en vez de una URL: un <img src> común traga las
                                        // dos, cualquier cosa que arme la URL a mano no.
                                        src={album.coverUrl}
                                        alt={album.title}
                                        loading="lazy"
                                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    /* Un momento puede existir sin fotos: el panel los
                                       crea vacíos y las fotos se suben después. */
                                    <span className="grid size-full place-items-center bg-muted text-muted-foreground">
                                        <Images className="size-8" />
                                    </span>
                                )}

                                <span
                                    aria-hidden
                                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
                                />

                                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                                    <span className="flex flex-wrap items-center gap-2">
                                        {album.category && (
                                            <span
                                                className="w-fit rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase"
                                                style={{ backgroundColor: album.category.color }}
                                            >
                                                {album.category.name}
                                            </span>
                                        )}
                                        <span className="text-[11px] font-semibold text-white/70">
                                            {album.imageCount === 1
                                                ? '1 foto'
                                                : `${album.imageCount} fotos`}
                                        </span>
                                    </span>

                                    <span className="font-display text-sm font-bold text-white">
                                        {album.title}
                                    </span>

                                    {album.date && (
                                        <span className="text-[11px] text-white/60">
                                            {formatCalendarDate(album.date, "d 'de' MMMM 'de' yyyy")}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        ))}
                </div>

                {isError && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar la galería. Probá recargar en unos minutos.
                    </p>
                )}

                {!isLoading && !isError && albums.length === 0 && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        {categoryId
                            ? 'No hay momentos en esta categoría.'
                            : 'Todavía no hay momentos cargados.'}
                    </p>
                )}

                {meta && (
                    <div className="mt-12">
                        <Pagination
                            meta={meta}
                            onPageChange={setPage}
                            // Sin esto se podía pasar de la última página con
                            // clicks rápidos, porque el meta todavía era el viejo.
                            disabled={isPlaceholderData}
                            align="center"
                        />
                    </div>
                )}
            </section>
        </>
    )
}
