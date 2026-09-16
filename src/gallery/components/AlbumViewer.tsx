import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSnapTrack } from '../hooks/useSnapTrack'
import { imageLoading, indexForKey } from '../lib/carousel'
import { photoAlt, photoCounter } from '../lib/moment-labels'
import type { GalleryAlbum } from '../interfaces/Gallery'

interface Props {
    album: GalleryAlbum
    /** `null` = cerrado. La foto sale de `?visor=N`. */
    index: number | null
    onIndexChange: (index: number) => void
    onClose: () => void
    /** El fundido de entrada solo si alguien tocó "abrir" (ver abajo). */
    fadeIn: boolean
    /** A dónde vuelve el foco al cerrar. */
    onCloseAutoFocus: () => void
}

/*
 * Mismos botones que las flechas del escenario, un paso más grandes. Foco en
 * Celeste Escudo sobre oscuro (Regla de los Dos Celestes).
 */
const DARK_BUTTON =
    'grid flex-none place-items-center rounded-lg border border-white/16 bg-white/6 text-white transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-secondary aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-white/6'

/** Overlay y Content entran y salen juntos, con el mismo fundido. */
const FADE = (fadeIn: boolean) =>
    cn(
        fadeIn && 'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-180',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150',
    )

/**
 * La pantalla completa de un momento, sobre el Dialog de Radix con primitivas
 * propias (no el `DialogContent` de shadcn, que es una tarjeta clara). Radix da
 * lo que las maquetas hacían a mano: foco atrapado, Esc, fondo inerte y
 * `aria-modal`.
 *
 * - El `Overlay` NO es decorativo: en Radix el bloqueo del scroll de la página
 *   vive ahí adentro (RemoveScroll), no en el Content. Sin él, la rueda o un
 *   arrastre vertical sobre la foto movían la página de atrás; al cerrar, la
 *   persona aparecía en el pie, y en el teléfono la barra del navegador
 *   cambiaba el alto del visor en medio del gesto. El Content va como shard de
 *   ese bloqueo, así que la pista sigue deslizando de costado.
 * - Negro Escudo SÓLIDO y no al 90–96%: al 96% el header y "Más momentos" se
 *   seguían leyendo como fantasmas detrás de la foto. Una foto del club se
 *   mira sin nada atrás.
 * - En desktop, flechas a los costados y contador arriba; en el celular bajan
 *   a una barra inferior, al alcance del pulgar (uso a una mano, 44px).
 * - El fundido de entrada solo cuando alguien toca "abrir". Quien entra por un
 *   enlace con `?visor=` (o recarga con el visor abierto) pidió la foto, no la
 *   página: con fundido veía asomarse la página del momento debajo durante el
 *   primer instante. Ahí aparece entero; el peor caso es "sin animación".
 */
export const AlbumViewer = ({ album, index, onIndexChange, onClose, fadeIn, onCloseAutoFocus }: Props) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const total = album.images.length
    const open = index !== null

    // Durante el fundido de salida la URL ya no tiene `?visor`: se sigue
    // mostrando la última foto, y no un negro vacío con la X sola.
    const [shownIndex, setShownIndex] = useState(index ?? 0)
    if (index !== null && index !== shownIndex) setShownIndex(index)

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (index === null || event.altKey || event.ctrlKey || event.metaKey) return
        const next = indexForKey(event.key, index, total, { homeEnd: true })
        if (next === null) return
        event.preventDefault()
        onIndexChange(next)
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogPrimitive.Portal>
                {/* Trae el bloqueo del scroll de la página (ver arriba). Queda
                    tapado por el Content, que va después con el mismo z. */}
                <DialogPrimitive.Overlay className={cn('fixed inset-0 z-100 bg-ink', FADE(fadeIn))} />
                <DialogPrimitive.Content
                    ref={contentRef}
                    aria-describedby={undefined}
                    onKeyDown={onKeyDown}
                    // El foco arranca en el diálogo y no en "Cerrar": con el foco
                    // en la X, Chrome le dibujaba el anillo apenas se abría.
                    onOpenAutoFocus={(event) => {
                        event.preventDefault()
                        contentRef.current?.focus({ preventScroll: true })
                    }}
                    onCloseAutoFocus={(event) => {
                        event.preventDefault()
                        onCloseAutoFocus()
                    }}
                    className={cn(
                        'fixed inset-0 z-100 grid grid-rows-[auto_minmax(0,1fr)_auto] bg-ink text-white outline-none',
                        FADE(fadeIn),
                    )}
                >
                    <ViewerBody album={album} index={shownIndex} onIndexChange={onIndexChange} />
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}

/**
 * El contenido va en un componente aparte para que la pista se arme al montar
 * el diálogo y no antes: recién ahí tiene ancho y se puede posicionar en la
 * foto de apertura.
 */
const ViewerBody = ({
    album,
    index,
    onIndexChange,
}: {
    album: GalleryAlbum
    index: number
    onIndexChange: (index: number) => void
}) => {
    const total = album.images.length
    const trackRef = useSnapTrack({ count: total, index, onIndexChange })
    const canPrevious = index > 0
    const canNext = index < total - 1
    const step = (delta: -1 | 1) => {
        if (delta === -1 ? canPrevious : canNext) onIndexChange(index + delta)
    }

    const arrow = (delta: -1 | 1, className: string, icon: ReactNode) => (
        <button
            type="button"
            aria-label={delta === -1 ? 'Foto anterior' : 'Foto siguiente'}
            // aria-disabled y no disabled: un botón deshabilitado pierde el foco
            // y el Tab se escapaba en la última foto.
            aria-disabled={delta === -1 ? !canPrevious : !canNext}
            onClick={() => step(delta)}
            className={cn(DARK_BUTTON, className)}
        >
            {icon}
        </button>
    )

    const counter = (className: string) => (
        <p aria-live="polite" className={cn('text-sm font-semibold text-white/70 tabular-nums', className)}>
            {photoCounter(index, total)}
        </p>
    )

    return (
        <>
            <div className="flex min-h-16 items-center gap-4 py-2.5 pr-3 pl-6 lg:pr-5">
                {/* El título del diálogo es el del momento: la foto no tiene uno
                    propio, y Radix necesita un DialogTitle para anunciar el
                    diálogo a un lector de pantalla. */}
                <DialogPrimitive.Title asChild>
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">{album.title}</p>
                </DialogPrimitive.Title>
                {total > 1 && counter('hidden pr-2 lg:block')}
                <DialogPrimitive.Close aria-label="Cerrar" className={cn(DARK_BUTTON, 'size-11')}>
                    <X className="size-5" />
                </DialogPrimitive.Close>
            </div>

            <div className="relative min-h-0">
                <div
                    ref={trackRef}
                    // Chrome vuelve enfocable un contenedor con scroll que no
                    // tiene nada enfocable adentro (las diapos del visor son
                    // imágenes): el Tab paraba en un DIV mudo entre "Cerrar" y
                    // las flechas. Las teclas ya las maneja el Content.
                    tabIndex={-1}
                    className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] motion-reduce:snap-none motion-reduce:touch-pan-y motion-reduce:overflow-x-hidden [&::-webkit-scrollbar]:hidden"
                >
                    {album.images.map((image, slide) => (
                        <div
                            key={image.id}
                            role="group"
                            aria-roledescription="foto"
                            aria-label={photoCounter(slide, total)}
                            inert={slide !== index}
                            className="h-full flex-[0_0_100%] snap-start snap-always lg:px-24 lg:pb-8"
                        >
                            <img
                                src={image.imageUrl}
                                alt={photoAlt(album.title, slide, total)}
                                loading={imageLoading(slide, index)}
                                decoding="async"
                                className="size-full object-contain"
                            />
                        </div>
                    ))}
                </div>

                {total > 1 && (
                    <>
                        {arrow(
                            -1,
                            'absolute top-[calc(50%-1rem)] left-6 hidden size-12 -translate-y-1/2 lg:grid',
                            <ChevronLeft className="size-5" />,
                        )}
                        {arrow(
                            1,
                            'absolute top-[calc(50%-1rem)] right-6 hidden size-12 -translate-y-1/2 lg:grid',
                            <ChevronRight className="size-5" />,
                        )}
                    </>
                )}
            </div>

            {total > 1 && (
                <div className="flex items-center justify-between gap-4 px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
                    {arrow(-1, 'size-11', <ChevronLeft className="size-5" />)}
                    {counter('')}
                    {arrow(1, 'size-11', <ChevronRight className="size-5" />)}
                </div>
            )}
        </>
    )
}
