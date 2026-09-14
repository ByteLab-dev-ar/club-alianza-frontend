/**
 * La geometría de los gráficos del Resumen: escalas, formas y la dona.
 *
 * Los gráficos son SVG escrito a mano y no una librería, a propósito: son seis
 * formas simples y PRODUCT.md tiene el peso del bundle como deuda conocida. Lo
 * que se puede equivocar en silencio —el techo del eje, los rótulos
 * abreviados, el caso de la dona con un solo tramo— vive acá y tiene test.
 */

export interface AxisScale {
    /** El valor que cae arriba de todo del área de dibujo. */
    top: number
    /** La distancia entre dos renglones de la grilla. */
    step: number
}

/**
 * El techo del eje en un número redondo, con cuatro renglones de grilla como
 * mucho.
 *
 * `integer` es para los ejes que cuentan personas: con un máximo de 9 socios el
 * paso redondo sería 2,5 y el eje diría "7,5 altas", que no existe. Ahí el paso
 * se busca solo entre enteros.
 *
 * Sin datos (todo en cero) devuelve un techo de 1: las barras quedan en cero y
 * no hay división por cero en la escala. Qué rótulos dibujar en ese caso lo
 * decide `axisTicks`.
 */
export const niceScale = (max: number, { integer = false }: { integer?: boolean } = {}): AxisScale => {
    if (!(max > 0)) return { top: 1, step: 1 }

    const magnitude = 10 ** Math.floor(Math.log10(max))
    const step =
        [1, 2, 2.5, 5, 10]
            .map((multiplier) => multiplier * magnitude)
            .find((candidate) => max / candidate <= 4 && (!integer || Number.isInteger(candidate))) ??
        10 * magnitude

    const safeStep = integer ? Math.max(1, Math.round(step)) : step

    return { top: Math.ceil(max / safeStep) * safeStep, step: safeStep }
}

/**
 * Los valores donde va un renglón de grilla, del cero al techo.
 *
 * Se multiplican y no se van sumando: `0.1 + 0.2` en coma flotante no da 0.3,
 * y un renglón de más o de menos al final del eje es exactamente ese error.
 * Con `max` en cero solo queda el renglón del cero: un eje que dice "1, 2, 3"
 * sobre un gráfico vacío inventa una escala que nadie midió.
 */
export const axisTicks = (scale: AxisScale, max: number): number[] => {
    if (!(max > 0)) return [0]

    const count = Math.round(scale.top / scale.step)
    return Array.from({ length: count + 1 }, (_, index) => index * scale.step)
}

const compactFormatter = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })

/**
 * El rótulo del eje, abreviado: "40k", "2,5k", "1,25 M".
 *
 * Los decimales no son adorno: el paso del eje puede ser 2.500, y redondear a
 * miles enteros escribía "3k, 5k, 8k" sobre renglones que valen 2.500, 5.000 y
 * 7.500.
 */
export const compactAxisValue = (value: number): string => {
    if (value >= 1_000_000) return `${compactFormatter.format(value / 1_000_000)} M`
    if (value >= 1_000) return `${compactFormatter.format(value / 1_000)}k`
    return compactFormatter.format(value)
}

const oneDecimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })
const noDecimals = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/**
 * Un importe corto para el centro de la dona, donde el número entero no entra:
 * "$ 3,7 M", "$ 363 k". Es un resumen visual: el importe exacto está en la
 * tabla y en el tooltip.
 */
export const compactMoney = (amount: number): string => {
    if (amount >= 1_000_000) return `$ ${oneDecimal.format(amount / 1_000_000)} M`
    if (amount >= 1_000) return `$ ${noDecimals.format(amount / 1_000)} k`
    return `$ ${noDecimals.format(amount)}`
}

// ------------------------------------------------------------------ formas

/** Columna con las esquinas de ARRIBA redondeadas: el pie crece desde la base. */
export const columnUpPath = (x: number, y: number, w: number, h: number, radius: number): string => {
    const r = Math.min(radius, w / 2, Math.max(h, 0))
    return (
        `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} ` +
        `L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`
    )
}

/** Columna que cuelga del cero: las esquinas redondeadas van ABAJO. */
export const columnDownPath = (x: number, y: number, w: number, h: number, radius: number): string => {
    const r = Math.min(radius, w / 2, Math.max(h, 0))
    return (
        `M${x},${y} L${x + w},${y} L${x + w},${y + h - r} ` +
        `Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} ` +
        `Q${x},${y + h} ${x},${y + h - r} Z`
    )
}

/** Barra horizontal con la PUNTA redondeada a la derecha y el arranque recto. */
export const barRightPath = (x: number, y: number, w: number, h: number, radius: number): string => {
    const r = Math.min(radius, h / 2, Math.max(w, 0))
    return (
        `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} ` +
        `L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`
    )
}

/** Barra que crece hacia la izquierda: la punta redondeada es la de allá. */
export const barLeftPath = (x: number, y: number, w: number, h: number, radius: number): string => {
    const r = Math.min(radius, h / 2, Math.max(w, 0))
    return (
        `M${x + w},${y} L${x + r},${y} Q${x},${y} ${x},${y + r} ` +
        `L${x},${y + h - r} Q${x},${y + h} ${x + r},${y + h} L${x + w},${y + h} Z`
    )
}

// -------------------------------------------------------------------- dona

const TURN = Math.PI * 2
/** La dona arranca arriba, a las doce, y gira en el sentido del reloj. */
const START_ANGLE = -Math.PI / 2

export interface DonutSegment {
    /** La posición del valor en la lista original, para buscar color y rótulo. */
    index: number
    /** El tramo entero, sin el aire: es el área de hover. */
    startAngle: number
    endAngle: number
    /** El tramo que se pinta, con medio aire recortado de cada punta. */
    drawStartAngle: number
    drawEndAngle: number
}

/**
 * Los tramos de la dona, en el orden de la lista.
 *
 * Un valor en cero no tiene tramo: un arco de largo cero se dibujaría igual
 * como una rayita del ancho del aire entre tramos.
 *
 * El aire (`gapAngle`, en radianes) se recorta de las puntas con dos límites:
 * con un solo valor no hay aire, porque no hay otro tramo del que separarse y
 * el anillo tiene que cerrar; y nunca se come más de medio tramo. Un tramo más
 * angosto que el aire quedaba con el final antes del principio, y el arco SVG
 * lo dibujaba como casi la vuelta entera: un medio con el 0,5% de la plata
 * pintaba la dona completa.
 */
export const donutSegments = (values: number[], gapAngle = 0): DonutSegment[] => {
    const total = values.reduce((sum, value) => sum + Math.max(value, 0), 0)
    if (total <= 0) return []

    const alone = values.filter((value) => value > 0).length === 1
    const segments: DonutSegment[] = []
    let angle = START_ANGLE

    values.forEach((value, index) => {
        if (value <= 0) return

        const sweep = (value / total) * TURN
        const inset = alone ? 0 : Math.min(gapAngle / 2, sweep / 4)

        segments.push({
            index,
            startAngle: angle,
            endAngle: angle + sweep,
            drawStartAngle: angle + inset,
            drawEndAngle: angle + sweep - inset,
        })
        angle += sweep
    })

    return segments
}

/**
 * El contorno de un tramo de dona entre dos ángulos.
 *
 * **La vuelta entera va en dos medias vueltas.** Un arco SVG que empieza y
 * termina en el mismo punto no dibuja nada: con un solo medio de pago en el
 * período —el caso de un club que recién abre el portal, donde todo es
 * efectivo— la dona quedaba vacía justo cuando tenía que estar llena.
 */
export const ringSegmentPath = (
    cx: number,
    cy: number,
    outer: number,
    inner: number,
    startAngle: number,
    endAngle: number,
): string => {
    const point = (radius: number, angle: number) =>
        `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`

    if (endAngle - startAngle >= TURN - 1e-9) {
        const half = startAngle + Math.PI
        return (
            `M${point(outer, startAngle)} ` +
            `A${outer},${outer} 0 1 1 ${point(outer, half)} ` +
            `A${outer},${outer} 0 1 1 ${point(outer, startAngle)} ` +
            `M${point(inner, startAngle)} ` +
            `A${inner},${inner} 0 1 0 ${point(inner, half)} ` +
            `A${inner},${inner} 0 1 0 ${point(inner, startAngle)} Z`
        )
    }

    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return (
        `M${point(outer, startAngle)} ` +
        `A${outer},${outer} 0 ${large} 1 ${point(outer, endAngle)} ` +
        `L${point(inner, endAngle)} ` +
        `A${inner},${inner} 0 ${large} 0 ${point(inner, startAngle)} Z`
    )
}
