import { useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import axios from 'axios'
import { ArrowLeft, Maximize } from 'lucide-react'

import { getApiErrorMessage } from '@/api/clubApi'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { AlbumStage } from '../components/AlbumStage'
import { AlbumViewer } from '../components/AlbumViewer'
import { CategoryChip } from '../components/CategoryMark'
import { GalleryNotice } from '../components/GalleryNotice'
import { RelatedAlbums } from '../components/RelatedAlbums'
import { useGalleryAlbum, useGalleryCategories, useRelatedAlbums } from '../hooks/useGallery'
import { useMomentViewer } from '../hooks/useGalleryUrl'
import { closeFocusTarget, type ViewerOpener } from '../lib/carousel'
import { backToGalleryHref, gallerySearchFromState } from '../lib/gallery-url'
import { momentMeta } from '../lib/moment-labels'
import type { GalleryAlbum } from '../interfaces/Gallery'

/**
 * Headline de DESIGN.md: fluido con clamp(), sin token de tamaño en el tema.
 *
 * NUNCA pasarlo por `cn()`: tailwind-merge toma `text-display` (la utilidad
 * propia de index.css: Hanken 900 con -0.02em) por un `text-*` más, choca con
 * `text-[clamp(...)]` y `text-ink`, y lo borra. El título salía en 700 y sin
 * tracking. Se concatena a mano.
 */
const HEADLINE = 'text-display text-[clamp(1.875rem,3.4vw,2.5rem)] leading-[1.1] text-balance text-ink'

/**
 * La página de un momento: el escenario con sus fotos, la ficha al costado y
 * la pantalla completa en `?visor=N`.
 *
 * Las dos fallas del backend son distintas y se muestran distinto: un id que no
 * es UUID da 400 y significa "la URL está rota"; un UUID que no existe da 404 y
 * significa "esto ya no está". Mezclarlas manda a alguien a revisar un enlace
 * que está bien, o al revés.
 */
export const GalleryAlbumPage = () => {
    const { id } = useParams<{ id: string }>()
    const { data: album, isLoading, isError, error } = useGalleryAlbum(id)

    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    const isBrokenUrl = status === 400
    const isGone = status === 404

    if (isLoading) {
        return (
            <section aria-busy className="mx-auto max-w-7xl px-6 pt-3 pb-16 lg:pt-12 lg:pb-20">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-12">
                    <Skeleton className="-mx-6 aspect-4/3 rounded-none lg:mx-0 lg:aspect-3/2 lg:rounded-lg" />
                    <div className="grid content-start gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-10 w-44" />
                    </div>
                </div>
            </section>
        )
    }

    if (isError || !album) {
        return (
            <section className="mx-auto grid max-w-7xl justify-items-center px-6 py-24 text-center">
                <p className="kicker text-brand">Galería</p>
                <h1 className={`${HEADLINE} mt-3`}>
                    {isGone
                        ? 'Este momento ya no está'
                        : isBrokenUrl
                          ? 'El enlace no es válido'
                          : 'No pudimos cargar el momento'}
                </h1>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
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

    // `key`: al pasar de un momento a otro (desde "Más momentos") la foto
    // actual, la pista y el visor arrancan de cero, sin arrastrar el índice.
    return <AlbumDetail key={album.id} album={album} />
}

const AlbumDetail = ({ album }: { album: GalleryAlbum }) => {
    const location = useLocation()
    const total = album.images.length
    const hasPhotos = total > 0
    const galleryHref = backToGalleryHref(location.state)

    const { viewerIndex, isOpen, openViewer, showPhoto, closeViewer } = useMomentViewer(total)

    // La foto del escenario. Con el visor abierto sigue a la del visor, así al
    // cerrarlo (con la X, Esc o el atrás del teléfono) queda en la que se
    // estaba mirando. Un `?visor=N` al cargar arranca el escenario en N.
    const [stageIndex, setStageIndex] = useState(viewerIndex ?? 0)
    if (viewerIndex !== null && viewerIndex !== stageIndex) setStageIndex(viewerIndex)

    // El fundido solo si se abrió con un click (ver AlbumViewer).
    const [fadeIn, setFadeIn] = useState(false)
    const openedFrom = useRef<ViewerOpener>(null)
    const slideButtons = useRef<(HTMLButtonElement | null)[]>([])
    const fullscreenButton = useRef<HTMLButtonElement>(null)

    const open = (index: number, from: Exclude<ViewerOpener, null>) => {
        openedFrom.current = from
        setFadeIn(true)
        openViewer(index)
    }

    // A dónde vuelve el foco al cerrar: ver closeFocusTarget.
    const restoreFocus = () => {
        const target = closeFocusTarget(openedFrom.current, stageIndex)
        const element = target === 'fullscreen' ? fullscreenButton.current : slideButtons.current[target]
        element?.focus({ preventScroll: true })
    }

    const related = useRelatedAlbums(album.category?.id, album.id)
    // Para el link "Ver todos los de X": con la lista se ven los choques de
    // slug (ver categorySlug). Casi siempre ya está en cache desde el listado.
    const categories = useGalleryCategories().data ?? []

    return (
        <section className="mx-auto max-w-7xl px-6 pt-3 pb-16 lg:pt-12 lg:pb-20">
            {/*
              En el DOM el título va antes que las fotos, para que el lector de
              pantalla anuncie qué momento es. En el celular la grilla reordena:
              "← Galería" arriba de todo (volver no puede quedar a 400px de
              scroll) y el escenario a sangre antes de la ficha. El foco sigue
              al orden visual porque la ficha no tiene nada enfocable.

              Sin fotos no hay carrusel que mirar primero: la ficha sube y la
              caja vacía queda debajo del título, que es lo que explica qué
              momento es.
            */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-12">
                <div className={cn('flex justify-self-start lg:col-start-2 lg:row-start-1', hasPhotos && 'order-1')}>
                    {/* Desde lg, sin el alto mínimo de 44px y 4px arriba: el
                        interlineado bajaba las mayúsculas a la fila 126 con el
                        borde del escenario en la 121; así quedan en la 122
                        (medido en la captura, no en la caja). El contenedor es
                        `flex` a propósito: con el link como inline-flex suelto,
                        el renglón del div se quedaba con su alto y el margen
                        negativo no movía nada. */}
                    <Link
                        to={galleryHref}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand lg:-mt-1 lg:min-h-0"
                    >
                        <ArrowLeft aria-hidden className="size-4" />
                        Galería
                    </Link>
                </div>

                <div className={cn('mt-6 lg:col-start-2 lg:row-start-2 lg:mt-5', hasPhotos && 'order-3')}>
                    {album.category && <CategoryChip category={album.category} />}
                    <h1 className={`${HEADLINE} mt-3 first:mt-0`}>{album.title}</h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {momentMeta(album.date, total)}
                    </p>
                    {album.description && (
                        <p className="mt-4 max-w-152 text-base leading-relaxed text-foreground">
                            {album.description}
                        </p>
                    )}
                </div>

                <div
                    className={cn(
                        'lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:self-start',
                        hasPhotos ? 'order-2' : 'mt-6 lg:mt-0',
                    )}
                >
                    {hasPhotos ? (
                        <AlbumStage
                            album={album}
                            index={stageIndex}
                            onIndexChange={setStageIndex}
                            onOpen={(index) => open(index, 'photo')}
                            keyboard={!isOpen}
                            slideButtons={slideButtons}
                        />
                    ) : (
                        // Un momento puede no tener ninguna foto: nace vacío desde
                        // el panel y las fotos se suben después.
                        <GalleryNotice
                            title="Este momento todavía no tiene fotos cargadas."
                            className="aspect-4/3 content-center max-sm:aspect-auto"
                            action={
                                <Button asChild variant="outline">
                                    <Link to={galleryHref}>Ver otros momentos</Link>
                                </Button>
                            }
                        />
                    )}
                </div>

                <div className={cn('lg:col-start-2 lg:row-start-3', hasPhotos && 'order-4')}>
                    {hasPhotos && (
                        <div className="mt-6 grid gap-3 lg:justify-items-start">
                            <Button
                                ref={fullscreenButton}
                                variant="dark"
                                className="h-11 w-full lg:h-10 lg:w-auto"
                                onClick={() => open(stageIndex, 'fullscreen')}
                            >
                                <Maximize />
                                Pantalla completa
                            </Button>
                            {/* Solo donde hay teclado: en el celular sería una promesa
                                que no se puede cumplir. */}
                            {total > 1 && (
                                <p className="hidden text-sm leading-relaxed text-muted-foreground lg:pointer-fine:block">
                                    También podés pasar las fotos con{' '}
                                    <kbd className="inline-grid min-w-6 place-items-center rounded-sm border border-b-2 bg-card px-1 font-sans leading-5 text-foreground">
                                        ←
                                    </kbd>{' '}
                                    <kbd className="inline-grid min-w-6 place-items-center rounded-sm border border-b-2 bg-card px-1 font-sans leading-5 text-foreground">
                                        →
                                    </kbd>
                                </p>
                            )}
                        </div>
                    )}

                    {album.category && related.data && (
                        <RelatedAlbums
                            category={album.category}
                            categories={categories}
                            albums={related.data}
                            from={gallerySearchFromState(location.state)}
                        />
                    )}
                </div>
            </div>

            {hasPhotos && (
                <AlbumViewer
                    album={album}
                    index={viewerIndex}
                    onIndexChange={showPhoto}
                    onClose={closeViewer}
                    fadeIn={fadeIn}
                    onCloseAutoFocus={restoreFocus}
                />
            )}
        </section>
    )
}
