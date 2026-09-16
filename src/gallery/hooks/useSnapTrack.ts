import { useEffect, useLayoutEffect, useRef } from 'react'

import { clampIndex, indexFromScroll, swipeStep } from '../lib/carousel'

interface Options {
    count: number
    /** La foto que tiene que verse. La pista la sigue; no guarda estado propio. */
    index: number
    /** El swipe (o el scroll de la pista) llegó a otra foto. */
    onIndexChange: (index: number) => void
}

/**
 * La pista con scroll-snap del escenario y del visor, sin librerías.
 *
 * El swipe es el scroll nativo: sigue al dedo con cero JS, y el índice cambia
 * al pasar la mitad. Flechas, puntos, miniaturas y teclado cambian `index`
 * desde afuera, y la pista salta con `behavior: 'instant'`: un corte directo,
 * nunca un carrusel animado.
 *
 * Con `prefers-reduced-motion` la pista no se desplaza (lo pone el CSS del
 * componente) y el swipe se detecta a mano con el mismo corte.
 */
export const useSnapTrack = ({ count, index, onIndexChange }: Options) => {
    const trackRef = useRef<HTMLDivElement>(null)
    const latest = useRef({ count, index, onIndexChange })
    // Último índice avisado: mientras la URL (o el estado) todavía no refleja
    // el cambio, el scroll sigue disparando y avisaría la misma foto varias veces.
    const reported = useRef(index)

    useLayoutEffect(() => {
        latest.current = { count, index, onIndexChange }
    })

    // La pista va a la foto pedida. Si ya está ahí no se toca: pasa en medio
    // de un swipe, cuando el índice cambió justamente por el scroll, y un
    // scrollTo en ese momento cortaba el gesto.
    useLayoutEffect(() => {
        reported.current = index
        const track = trackRef.current
        if (!track || track.clientWidth === 0) return
        if (indexFromScroll(track.scrollLeft, track.clientWidth, count) !== index) {
            track.scrollTo({ left: index * track.clientWidth, behavior: 'instant' })
        }
    }, [index, count])

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const report = (next: number) => {
            if (next === reported.current) return
            reported.current = next
            latest.current.onIndexChange(next)
        }

        let frame = 0
        const onScroll = () => {
            if (frame) return
            frame = requestAnimationFrame(() => {
                frame = 0
                report(indexFromScroll(track.scrollLeft, track.clientWidth, latest.current.count))
            })
        }

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
        let touchStart: { x: number; y: number } | null = null
        const onTouchStart = (event: TouchEvent) => {
            const touch = event.touches[0]
            touchStart = reducedMotion.matches && touch ? { x: touch.clientX, y: touch.clientY } : null
        }
        const onTouchEnd = (event: TouchEvent) => {
            const touch = event.changedTouches[0]
            if (!touchStart || !touch) return
            const step = swipeStep(touch.clientX - touchStart.x, touch.clientY - touchStart.y)
            touchStart = null
            if (step !== 0) {
                const { index: current, count: total } = latest.current
                report(clampIndex(current + step, total))
            }
        }

        // Al cambiar el ancho (girar el teléfono, abrir el visor) la pista queda
        // entre dos fotos: se realinea a la actual. También cubre el visor, cuya
        // pista recién tiene ancho cuando se ve.
        //
        // SOLO si cambió el ancho: en el visor fijo del teléfono, la barra del
        // navegador que aparece o se esconde cambia el ALTO en medio de un
        // swipe, y reescribir scrollLeft ahí cortaba el gesto.
        let lastWidth = -1
        const resize = new ResizeObserver(() => {
            if (track.clientWidth === lastWidth) return
            lastWidth = track.clientWidth
            track.scrollLeft = latest.current.index * track.clientWidth
        })

        track.addEventListener('scroll', onScroll, { passive: true })
        track.addEventListener('touchstart', onTouchStart, { passive: true })
        track.addEventListener('touchend', onTouchEnd)
        resize.observe(track)

        return () => {
            track.removeEventListener('scroll', onScroll)
            track.removeEventListener('touchstart', onTouchStart)
            track.removeEventListener('touchend', onTouchEnd)
            resize.disconnect()
            cancelAnimationFrame(frame)
        }
    }, [])

    return trackRef
}
