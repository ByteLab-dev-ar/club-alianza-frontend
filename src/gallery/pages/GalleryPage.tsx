import { useState } from 'react'

import { formatCalendarDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { PageHero } from '@/components/custom/PageHero'
import { CategoryFilter } from '@/components/custom/CategoryFilter'
import { useGallery, useGalleryCategories } from '../hooks/useGallery'
import type { GalleryImage } from '../interfaces/Gallery'

const PAGE_SIZE = 12

export const GalleryPage = () => {
    const [categoryId, setCategoryId] = useState<string | undefined>()
    const [page, setPage] = useState(1)
    const [openImage, setOpenImage] = useState<GalleryImage | null>(null)

    const { data: categories = [] } = useGalleryCategories()
    const { data, isLoading, isError } = useGallery({ page, limit: PAGE_SIZE, categoryId })

    const images = data?.items ?? []
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
                        images.map((image) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setOpenImage(image)}
                                className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl border bg-muted text-left shadow-soft"
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={image.title}
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span
                                    aria-hidden
                                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
                                />
                                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                                    {image.category && (
                                        <span
                                            className="w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                                            style={{ backgroundColor: image.category.color }}
                                        >
                                            {image.category.name}
                                        </span>
                                    )}
                                    <span className="font-display text-sm font-bold text-white">
                                        {image.title}
                                    </span>
                                </span>
                            </button>
                        ))}
                </div>

                {isError && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar la galería. Probá recargar en unos minutos.
                    </p>
                )}

                {!isLoading && !isError && images.length === 0 && (
                    <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        {categoryId
                            ? 'No hay imágenes en esta categoría.'
                            : 'Todavía no hay imágenes cargadas.'}
                    </p>
                )}

                {meta && meta.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {meta.currentPage} de {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={page >= meta.totalPages}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </section>

            <Dialog open={!!openImage} onOpenChange={(open) => !open && setOpenImage(null)}>
                <DialogContent className="max-w-4xl p-3">
                    {openImage && (
                        <>
                            <img
                                src={openImage.imageUrl}
                                alt={openImage.title}
                                className="max-h-[70vh] w-full rounded-lg object-contain"
                            />
                            <div className="px-3 pt-4 pb-1">
                                <DialogTitle className="font-display text-lg font-bold">
                                    {openImage.title}
                                </DialogTitle>
                                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                                    {openImage.description ?? 'Sin descripción'}
                                </DialogDescription>
                                {openImage.date && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {formatCalendarDate(openImage.date, "d 'de' MMMM 'de' yyyy")}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
