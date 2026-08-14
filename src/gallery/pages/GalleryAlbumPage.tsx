import { useState } from 'react'
import { Link, useParams } from 'react-router'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'

import { formatCalendarDate } from '@/lib/format'
import { getApiErrorMessage } from '@/api/clubApi'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useGalleryAlbum } from '../hooks/useGallery'
import type { GalleryImage } from '../interfaces/Gallery'

/**
 * El detalle de un momento, con todas sus fotos.
 *
 * Las dos fallas del backend son distintas y se muestran distinto: un id que no
 * es UUID da 400 y significa "la URL está rota"; un UUID que no existe da 404 y
 * significa "esto ya no está". Mezclarlas manda a alguien a revisar un enlace
 * que está bien, o al revés.
 */
export const GalleryAlbumPage = () => {
    const { id } = useParams<{ id: string }>()
    const [openImage, setOpenImage] = useState<GalleryImage | null>(null)

    const { data: album, isLoading, isError, error } = useGalleryAlbum(id)

    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    const isBrokenUrl = status === 400
    const isGone = status === 404

    if (isLoading) {
        return (
            <section className="mx-auto max-w-5xl px-6 py-16">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-4 h-4 w-96" />
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="aspect-4/3 rounded-xl" />
                    ))}
                </div>
            </section>
        )
    }

    if (isError || !album) {
        return (
            <section className="mx-auto max-w-2xl px-6 py-24 text-center">
                <h1 className="text-display text-3xl text-ink">
                    {isGone
                        ? 'Este momento ya no está'
                        : isBrokenUrl
                          ? 'El enlace no es válido'
                          : 'No pudimos cargar el momento'}
                </h1>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                    {isGone
                        ? 'Puede que lo hayan borrado desde el panel del club.'
                        : isBrokenUrl
                          ? 'La dirección está mal formada. Revisá el enlace por el que llegaste.'
                          : getApiErrorMessage(error, 'Probá recargar la página en unos minutos.')}
                </p>
                <Button asChild variant="dark" className="mt-8">
                    <Link to="/galeria">
                        <ArrowLeft /> Volver a la galería
                    </Link>
                </Button>
            </section>
        )
    }

    return (
        <>
            <section className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
                <Link
                    to="/galeria"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
                >
                    <ArrowLeft className="size-4" /> Galería
                </Link>

                <div className="mt-6 border-t-[3px] border-secondary pt-6">
                    {album.category && (
                        <span
                            className="inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase"
                            style={{ backgroundColor: album.category.color }}
                        >
                            {album.category.name}
                        </span>
                    )}

                    <h1 className="text-display mt-3 text-3xl leading-tight text-ink lg:text-4xl">
                        {album.title}
                    </h1>

                    <p className="mt-3 text-sm text-muted-foreground">
                        {album.date && formatCalendarDate(album.date, "d 'de' MMMM 'de' yyyy")}
                        {album.date && album.imageCount > 0 && ' · '}
                        {album.imageCount > 0 &&
                            (album.imageCount === 1 ? '1 foto' : `${album.imageCount} fotos`)}
                    </p>

                    {album.description && (
                        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
                            {album.description}
                        </p>
                    )}
                </div>

                {/* Un momento puede no tener ninguna foto: nace vacío desde el panel
                    y alguien puede haber abandonado antes de subirlas. */}
                {album.images.length === 0 ? (
                    <p className="mt-10 rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                        Este momento todavía no tiene fotos cargadas.
                    </p>
                ) : (
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        {album.images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setOpenImage(image)}
                                className="group aspect-4/3 cursor-pointer overflow-hidden rounded-xl border bg-muted shadow-soft"
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={`${album.title} — foto ${index + 1} de ${album.images.length}`}
                                    loading={index < 2 ? 'eager' : 'lazy'}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <Dialog open={!!openImage} onOpenChange={(open) => !open && setOpenImage(null)}>
                <DialogContent className="max-w-4xl p-3">
                    {openImage && (
                        <>
                            {/* El título del diálogo es el del momento: la foto no tiene
                                uno propio, y Radix necesita un DialogTitle para anunciar
                                el diálogo a un lector de pantalla. */}
                            <DialogTitle className="sr-only">{album.title}</DialogTitle>
                            <img
                                src={openImage.imageUrl}
                                alt={`${album.title} — foto ${openImage.displayOrder + 1}`}
                                className="max-h-[80vh] w-full rounded-lg object-contain"
                            />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
