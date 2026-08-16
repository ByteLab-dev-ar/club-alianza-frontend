import { useCallback, useEffect, useImperativeHandle, useRef, useState, type RefObject } from 'react'

/** El trazo, en negro sobre transparente: el PDF lo compone el servidor. */
const STROKE_COLOR = '#111111'
const STROKE_WIDTH = 2.5

export interface SignaturePadHandle {
    /** `null` si no hay ningún trazo: no se manda una firma en blanco. */
    toBlob: () => Promise<Blob | null>
    clear: () => void
}

interface Props {
    ref: RefObject<SignaturePadHandle | null>
    /** Se avisa al primer trazo y al borrar, para habilitar el botón de afuera. */
    onDrawnChange?: (hasDrawn: boolean) => void
    disabled?: boolean
}

/**
 * El recuadro donde la persona firma con el dedo o el mouse (§1.4.b).
 *
 * Escrito a mano y sin librería a propósito: son cuarenta líneas de canvas y el
 * portal se usa desde el teléfono, muchas veces en la puerta del club — sumar un
 * paquete para dibujar una línea empeora justamente lo que este producto cuida.
 *
 * Dos detalles que no son opcionales:
 *
 * - **El canvas se dimensiona en píxeles del dispositivo.** Con el ancho en CSS
 *   solamente, en un celular con DPR 3 el trazo sale pixelado y la firma que
 *   queda archivada es peor que la del papel.
 * - **`touch-action: none`.** Sin eso, arrastrar el dedo sobre el recuadro
 *   scrollea la página en vez de firmar, que es exactamente el gesto que hace
 *   falta.
 */
export const SignaturePad = ({ ref, onDrawnChange, disabled = false }: Props) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawingRef = useRef(false)
    const [hasDrawn, setHasDrawn] = useState(false)

    const context = () => canvasRef.current?.getContext('2d') ?? null

    /**
     * Ajusta el buffer del canvas al tamaño real que ocupa en pantalla.
     *
     * Redimensionar un canvas lo BORRA, así que sale temprano cuando las medidas
     * no cambiaron: en el teléfono el ResizeObserver se dispara al aparecer y
     * desaparecer la barra del navegador, y sin esta guarda la firma a medio
     * hacer se borraba sola al scrollear.
     *
     * Cuando SÍ cambia, se resetea `hasDrawn`: dejar el flag en true sobre un
     * lienzo ya vacío habilitaría el botón de firmar con nada dibujado.
     */
    const resize = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = context()
        if (!canvas || !ctx) return

        const { width, height } = canvas.getBoundingClientRect()
        if (width === 0) return

        const ratio = window.devicePixelRatio || 1
        const nextWidth = Math.round(width * ratio)
        const nextHeight = Math.round(height * ratio)
        if (canvas.width === nextWidth && canvas.height === nextHeight) return

        canvas.width = nextWidth
        canvas.height = nextHeight
        ctx.scale(ratio, ratio)

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = STROKE_COLOR
        ctx.lineWidth = STROKE_WIDTH

        setHasDrawn(false)
        onDrawnChange?.(false)
    }, [onDrawnChange])

    useEffect(() => {
        resize()

        const canvas = canvasRef.current
        if (!canvas || typeof ResizeObserver === 'undefined') return

        const observer = new ResizeObserver(resize)
        observer.observe(canvas)
        return () => observer.disconnect()
    }, [resize])

    const positionOf = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const startStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled) return
        const ctx = context()
        if (!ctx) return

        // Captura el puntero: si el dedo se va del recuadro y vuelve, el trazo
        // sigue siendo uno solo en vez de cortarse y arrancar otro.
        event.currentTarget.setPointerCapture(event.pointerId)
        isDrawingRef.current = true

        const { x, y } = positionOf(event)
        ctx.beginPath()
        ctx.moveTo(x, y)

        // Un toque sin arrastre también es un trazo (un punto), así que cuenta.
        if (!hasDrawn) {
            setHasDrawn(true)
            onDrawnChange?.(true)
        }
    }

    const continueStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return
        const ctx = context()
        if (!ctx) return

        const { x, y } = positionOf(event)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const endStroke = () => {
        isDrawingRef.current = false
    }

    const clear = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = context()
        if (!canvas || !ctx) return

        // En unidades del buffer, no de CSS: el `scale` del DPR ya está aplicado
        // a la transformación, y limpiar con el ancho en CSS dejaría sin borrar
        // la parte de abajo a la derecha en cualquier pantalla con DPR > 1.
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.restore()

        setHasDrawn(false)
        onDrawnChange?.(false)
    }, [onDrawnChange])

    useImperativeHandle(
        ref,
        () => ({
            clear,
            toBlob: () =>
                new Promise<Blob | null>((resolve) => {
                    const canvas = canvasRef.current
                    if (!canvas || !hasDrawn) return resolve(null)
                    canvas.toBlob(resolve, 'image/png')
                }),
        }),
        [clear, hasDrawn],
    )

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                onPointerDown={startStroke}
                onPointerMove={continueStroke}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
                className="h-40 w-full touch-none rounded-lg border border-dashed bg-background disabled:opacity-50"
                style={{ cursor: disabled ? 'not-allowed' : 'crosshair' }}
            />

            {!hasDrawn && (
                <p
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-muted-foreground"
                >
                    Firmá acá con el dedo o el mouse
                </p>
            )}
        </div>
    )
}
