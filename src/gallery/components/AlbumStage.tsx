import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSnapTrack } from '../hooks/useSnapTrack'
import { imageLoading, indexForKey, isEditableTarget } from '../lib/carousel'
import { photoAlt, photoCounter } from '../lib/moment-labels'
import type { GalleryAlbum } from '../interfaces/Gallery'

interface Props {
    album: GalleryAlbum
    index: number
    onIndexChange: (index: number) => void
    /** Tocar una foto la abre en pantalla completa. */
    onOpen: (index: number) => void
    /** Las flechas del teclado pasan fotos, salvo con el visor abierto (ahí las maneja él). */
    keyboard: boolean
    /** Para devolverle el foco a la foto a la vista al cerrar el visor. */
    slideButtons: RefObject<(HTMLButtonElement | null)[]>
}

/*
 * Los controles del escenario van sobre Negro Escudo: el foco pasa a Celeste
 * Escudo, porque el anillo base (Celeste Profundo) no se ve sobre --ink
 * (Regla de los Dos Celestes).
 */
const DARK_BUTTON =
    'place-items-center rounded-lg border border-white/16 bg-white/6 text-white transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-secondary aria-disabled:cursor-default aria-disabled:opacity-30 aria-disabled:hover:bg-white/6'

/**
 * El escenario de la página del momento: una foto grande por vez, con la tira
 * de miniaturas (o los puntos, en el celular) y el contador debajo.
 *
 * - Tamaño fijo con la foto en `contain`. Las fotos no traen ancho ni alto: si
 *   la caja se ajustara a cada una, la tira y la ficha saltarían al pasar de
 *   una apaisada a una vertical.
 * - 3:2 en desktop y 4:3 en el celular: con 4:3 y las calles de las flechas,
 *   una 16:9 quedaba con franjas de 110px. En el celular no hay calles y las
 *   verticales necesitan el alto.
 * - `max-h` con la ventana: en una notebook de 768 entran escenario y
 *   miniaturas sin bajar.
 * - `overflow-hidden` no es solo por el radio: una caja con aspect-ratio crece
 *   hasta el alto de su contenido, y una foto vertical la estiraba.
 * - A sangre y sin radio en el celular.
 * - Las flechas viven en calles oscuras a los costados (4rem de relleno en
 *   cada diapo), nunca encima de la foto (Principio 4). Se pierden 128px de
 *   ancho, pero las verticales no pierden nada.
 * - El contador va FUERA del escenario: sobre papel en Gris Dicho da 6.4:1 y
 *   le devuelve a la foto la franja de abajo.
 * - Con una sola foto no hay flechas, ni pie, ni atajo.
 */
export const AlbumStage = ({ album, index, onIndexChange, onOpen, keyboard, slideButtons }: Props) => {
    const total = album.images.length
    const trackRef = useSnapTrack({ count: total, index, onIndexChange })

    /*
     * Con el foco en la foto (Tab, o al cerrar el visor) y ← →, la diapo que
     * lo tenía pasa a `inert` y el navegador suelta el foco en <body>: se iba
     * el anillo, Enter dejaba de abrir la pantalla completa y el próximo Tab
     * arrancaba desde el header. Se anota ANTES de cambiar de foto (después
     * el navegador ya puede haberlo soltado) y se lleva a la diapo nueva.
     */
    const focusFollows = useRef(false)
    useLayoutEffect(() => {
        if (!focusFollows.current) return
        focusFollows.current = false
        slideButtons.current[index]?.focus({ preventScroll: true })
    }, [index, slideButtons])

    useEffect(() => {
        if (!keyboard || total <= 1) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return
            if (isEditableTarget(event.target as HTMLElement | null)) return
            const next = indexForKey(event.key, index, total)
            if (next === null) return
            // Sin esto, con el foco en una foto, la flecha también desplazaba
            // la pista por su cuenta y peleaba con el corte.
            event.preventDefault()
            focusFollows.current = slideButtons.current.some((button) => button !== null && button === document.activeElement)
            onIndexChange(next)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [keyboard, total, index, onIndexChange, slideButtons])

    const canPrevious = index > 0
    const canNext = index < total - 1
    const step = (delta: -1 | 1) => {
        if (delta === -1 ? canPrevious : canNext) onIndexChange(index + delta)
    }

    return (
        <>
            <div
                role="region"
                aria-roledescription="carrusel"
                aria-label={`Fotos de ${album.title}`}
                className="relative -mx-6 aspect-4/3 overflow-hidden bg-ink lg:mx-0 lg:aspect-3/2 lg:max-h-[calc(100vh-12rem)] lg:min-h-96 lg:w-full lg:rounded-lg"
            >
                <div
                    ref={trackRef}
                    className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] motion-reduce:snap-none motion-reduce:touch-pan-y motion-reduce:overflow-x-hidden [&::-webkit-scrollbar]:hidden"
                >
                    {album.images.map((image, slide) => (
                        <div
                            key={image.id}
                            role="group"
                            aria-roledescription="foto"
                            aria-label={photoCounter(slide, total)}
                            // Las fotos de al lado quedan fuera del Tab y del
                            // lector: el foco en una diapo fuera de vista
                            // desplazaba la pista sin avisar. Ojo: `inert`
                            // también SUELTA el foco de la diapo que deja de
                            // verse; por eso `focusFollows`, arriba.
                            inert={slide !== index}
                            className="h-full flex-[0_0_100%] snap-start snap-always lg:px-16 lg:py-4"
                        >
                            <button
                                ref={(element) => {
                                    slideButtons.current[slide] = element
                                }}
                                type="button"
                                onClick={() => onOpen(slide)}
                                className="block size-full cursor-zoom-in focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-secondary"
                            >
                                <img
                                    // Data URI o URL, tal cual (ver AlbumCard).
                                    src={image.imageUrl}
                                    alt={photoAlt(album.title, slide, total)}
                                    loading={imageLoading(slide, index)}
                                    decoding="async"
                                    className="size-full object-contain"
                                />
                                <span className="sr-only">(ver en pantalla completa)</span>
                            </button>
                        </div>
                    ))}
                </div>

                {total > 1 && (
                    <>
                        {/* aria-disabled y no disabled: un botón deshabilitado
                            pierde el foco, y en la última foto el Tab se
                            escapaba a cualquier lado. */}
                        <button
                            type="button"
                            aria-label="Foto anterior"
                            aria-disabled={!canPrevious}
                            onClick={() => step(-1)}
                            className={cn(DARK_BUTTON, 'absolute top-1/2 left-3.5 hidden size-11 -translate-y-1/2 lg:grid')}
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            aria-label="Foto siguiente"
                            aria-disabled={!canNext}
                            onClick={() => step(1)}
                            className={cn(DARK_BUTTON, 'absolute top-1/2 right-3.5 hidden size-11 -translate-y-1/2 lg:grid')}
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </>
                )}
            </div>

            {total > 1 && (
                <div className="mt-1 flex min-h-11 items-center justify-between gap-4 lg:mt-4">
                    <ul className="hidden gap-3 lg:flex">
                        {album.images.map((image, slide) => (
                            <li key={image.id}>
                                {/* La actual con un aro de papel + Celeste Profundo
                                    (ring con offset, no outline): así el anillo de
                                    foco del teclado sigue siendo otra cosa. */}
                                <button
                                    type="button"
                                    aria-label={`Ver foto ${slide + 1} de ${total}`}
                                    aria-current={slide === index}
                                    onClick={() => onIndexChange(slide)}
                                    className="block aspect-4/3 w-22 overflow-hidden rounded-sm border bg-muted transition-[box-shadow,border-color] hover:border-muted-foreground aria-[current=true]:border-transparent aria-[current=true]:ring-2 aria-[current=true]:ring-brand aria-[current=true]:ring-offset-2 aria-[current=true]:ring-offset-background"
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-cover"
                                    />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="flex lg:hidden">
                        {album.images.map((image, slide) => (
                            <button
                                key={image.id}
                                type="button"
                                aria-label={`Ver foto ${slide + 1} de ${total}`}
                                aria-current={slide === index}
                                onClick={() => onIndexChange(slide)}
                                className="group grid h-11 w-8 place-items-center justify-start"
                            >
                                {/* Solo el color transiciona: animar el ancho reacomoda la
                                    fila en cada cuadro mientras el dedo todavía arrastra
                                    la pista, y en un celular modesto se nota. */}
                                <span className="h-2 w-2 rounded-xs bg-muted-foreground/45 transition-colors group-aria-[current=true]:w-5 group-aria-[current=true]:bg-brand" />
                            </button>
                        ))}
                    </div>

                    {/* Con el visor abierto, región viva apagada: Radix oculta el
                        fondo con aria-hidden pero deja a la vista a propósito los
                        [aria-live], y como el escenario sigue a la foto del visor,
                        cada → se anunciaba dos veces. */}
                    <p
                        aria-live={keyboard ? 'polite' : 'off'}
                        className="flex-none text-sm font-semibold text-muted-foreground tabular-nums"
                    >
                        {photoCounter(index, total)}
                    </p>
                </div>
            )}
        </>
    )
}
