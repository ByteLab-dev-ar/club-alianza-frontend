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
    /**
     * El mismo dato que `hasDrawn`, en ref.
     *
     * `resize` corre desde un ResizeObserver y lee el estado por closure, que
     * puede estar viejo. La ref siempre dice la verdad en el momento en que se
     * la pregunta.
     */
    const hasDrawnRef = useRef(false)

    const context = () => canvasRef.current?.getContext('2d') ?? null

    /** Un solo lugar que mueve el flag, la ref y el aviso al de afuera. */
    const setDrawn = useCallback(
        (value: boolean) => {
            hasDrawnRef.current = value
            setHasDrawn(value)
            onDrawnChange?.(value)
        },
        [onDrawnChange],
    )

    /**
     * Ajusta el buffer del canvas al tamaño real que ocupa en pantalla,
     * **conservando lo que ya se había firmado**.
     *
     * Redimensionar un canvas lo borra, así que sale temprano cuando las medidas
     * no cambiaron: en el teléfono el ResizeObserver se dispara al aparecer y
     * desaparecer la barra del navegador, y sin esa guarda la firma a medio
     * hacer se perdía al scrollear.
     *
     * Pero esa guarda no alcanzaba cuando el tamaño cambia DE VERDAD: girar el
     * teléfono, o cruzar el breakpoint donde el recuadro cambia de alto, dejaba
     * el lienzo en blanco y a la persona firmando otra vez sin entender por qué.
     * Por eso ahora se saca una foto del trazo antes de redimensionar y se vuelve
     * a dibujar encima. Se reescala un poco —es un bitmap, no vectores— y eso es
     * infinitamente mejor que perderla.
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

        // La foto se saca solo si hay algo que guardar, y del buffer entero:
        // copiar en unidades CSS perdería la mitad en pantallas con DPR > 1.
        let previous: HTMLCanvasElement | null = null
        if (hasDrawnRef.current && canvas.width > 0 && canvas.height > 0) {
            previous = document.createElement('canvas')
            previous.width = canvas.width
            previous.height = canvas.height
            previous.getContext('2d')?.drawImage(canvas, 0, 0)
        }

        canvas.width = nextWidth
        canvas.height = nextHeight
        ctx.scale(ratio, ratio)

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = STROKE_COLOR
        ctx.lineWidth = STROKE_WIDTH

        // En unidades CSS: el `scale` del DPR ya está aplicado, así que el
        // destino se expresa en el tamaño nuevo del recuadro.
        if (previous) {
            ctx.drawImage(previous, 0, 0, width, height)
            return
        }

        // Sin nada que conservar, el lienzo queda vacío y el flag tiene que
        // decirlo: en true habilitaría el botón de firmar con nada dibujado.
        setDrawn(false)
    }, [setDrawn])

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
        if (!hasDrawn) setDrawn(true)
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

        setDrawn(false)
    }, [setDrawn])

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
                /*
                 * 288px (h-72) y no los 160 de antes.
                 *
                 * A todo el ancho de una pantalla grande, 160px daban una franja
                 * de casi 6 a 1: un renglón donde la firma no tenía a dónde
                 * bajar. Con 288 queda en 3,3 a 1, que es la proporción de una
                 * firma de verdad.
                 *
                 * Es una altura fija y no responsive a propósito: cambiarla por
                 * breakpoint obligaría a redimensionar el canvas al cruzarlo, y
                 * aunque `resize` ahora conserva el trazo, reescalarlo lo
                 * degrada. Una sola medida no se cruza nunca.
                 */
                className="force-light h-72 w-full touch-none rounded-lg border border-dashed bg-background disabled:opacity-50"
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
