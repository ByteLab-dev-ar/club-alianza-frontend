/**
 * La geometría de los gráficos del Resumen: escalas y formas.
 *
 * Los gráficos son SVG escrito a mano y no una librería, a propósito: son
 * seis, de formas simples —columnas y barras—, y PRODUCT.md tiene el peso del
 * bundle como deuda conocida. Lo que se puede equivocar en silencio —el techo
 * del eje, los rótulos abreviados, los tramos de una barra al 100%— vive acá y
 * tiene test.
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

/**
 * Los dos tramos de una barra al 100% (el padrón en el gráfico de Membresía):
 * dónde termina el primero y dónde arranca el segundo, en píxeles.
 *
 * - Entre los dos tramos va `gap` de aire, del color de la tarjeta, como entre
 *   los tramos apilados de los otros gráficos. Si uno de los dos es cero no hay
 *   aire: el otro ocupa la barra entera.
 * - **Un tramo que no es cero nunca baja de `min` píxeles.** Con 1 vencida en
 *   un padrón de 450, la proporción da 1 px, que con el aire se come entero, y
 *   la barra afirmaría "todos vigentes" mientras el rótulo dice 1. Es una
 *   distorsión de un par de píxeles a cambio de no mentir sobre si hay alguien.
 * - Sin nada que repartir, los dos tramos miden cero: el gráfico dibuja la
 *   pista vacía y lo dice en palabras.
 */
export const splitBar = (
    first: number,
    second: number,
    width: number,
    { gap, min }: { gap: number; min: number },
): { firstWidth: number; secondX: number; secondWidth: number } => {
    const total = first + second

    if (!(total > 0)) return { firstWidth: 0, secondX: 0, secondWidth: 0 }
    if (second <= 0) return { firstWidth: width, secondX: width, secondWidth: 0 }
    if (first <= 0) return { firstWidth: 0, secondX: 0, secondWidth: width }

    const room = width - gap
    const firstWidth = Math.min(Math.max((first / total) * room, min), room - min)

    return { firstWidth, secondX: firstWidth + gap, secondWidth: room - firstWidth }
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
