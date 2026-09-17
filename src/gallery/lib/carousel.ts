/**
 * La navegación del escenario y del visor, sin DOM.
 *
 * Los dos usan la misma pista con scroll-snap: el swipe del navegador sigue al
 * dedo sin JS ni librerías, y flechas y teclado saltan con un corte directo
 * (sin carrusel animado). Lo que se decide acá es a qué foto ir.
 */

/** Umbral del swipe hecho a mano (solo con reduced motion). */
export const SWIPE_THRESHOLD = 40

export const clampIndex = (index: number, total: number): number =>
    total <= 0 ? 0 : Math.min(Math.max(index, 0), total - 1)

/**
 * La foto que se ve según el desplazamiento de la pista. El swipe nativo cambia
 * de foto al pasar el 50%. Con ancho 0 (la pista del visor antes de verse) es
 * la primera.
 */
export const indexFromScroll = (scrollLeft: number, width: number, total: number): number =>
    width > 0 ? clampIndex(Math.round(scrollLeft / width), total) : 0

/**
 * Con `prefers-reduced-motion` la pista no se desplaza, y el swipe se detecta
 * a mano: solo cuenta si es claramente horizontal. Devuelve el paso (1 =
 * siguiente, porque arrastrar a la izquierda trae la de la derecha).
 */
export const swipeStep = (dx: number, dy: number, threshold = SWIPE_THRESHOLD): -1 | 0 | 1 => {
    if (Math.abs(dx) <= threshold || Math.abs(dx) <= Math.abs(dy)) return 0
    return dx < 0 ? 1 : -1
}

/**
 * A qué foto lleva una tecla, o `null` si la tecla no hace nada (y entonces no
 * se le quita su comportamiento por defecto).
 *
 * Sin vuelta al principio: en la última foto la flecha queda apagada, como los
 * botones. Inicio/Fin solo dentro del visor: en la página son el scroll de
 * siempre y no se roban.
 */
export const indexForKey = (
    key: string,
    current: number,
    total: number,
    { homeEnd = false }: { homeEnd?: boolean } = {},
): number | null => {
    if (total <= 1) return null

    let next: number
    if (key === 'ArrowLeft') next = current - 1
    else if (key === 'ArrowRight') next = current + 1
    else if (homeEnd && key === 'Home') next = 0
    else if (homeEnd && key === 'End') next = total - 1
    else return null

    const clamped = clampIndex(next, total)
    return clamped === current ? null : clamped
}

/**
 * Las flechas de la página no se roban el cursor de un campo de texto. Hoy la
 * página del momento no tiene ninguno, pero el header o una extensión pueden.
 */
export const isEditableTarget = (
    target: { tagName?: string; isContentEditable?: boolean } | null,
): boolean => {
    if (!target) return false
    if (target.isContentEditable) return true
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
}

export type ViewerOpener = 'fullscreen' | 'photo' | null

/**
 * A dónde vuelve el foco al cerrar el visor: al botón "Pantalla completa" si
 * se abrió con él; si no, a la foto que quedó a la vista en el escenario.
 *
 * - Abierto tocando una foto y pasado a otra adentro: la tocada es ahora una
 *   diapo inerte, y devolverle el foco lo dejaba adentro de algo oculto.
 * - Abierto desde la URL (`null`): Radix lo devolvería a lo que tenía el foco
 *   antes, que al cargar la página es <body>. La foto a la vista es donde se
 *   sigue.
 */
export const closeFocusTarget = (openedFrom: ViewerOpener, stageIndex: number): 'fullscreen' | number =>
    openedFrom === 'fullscreen' ? 'fullscreen' : stageIndex

/**
 * La actual y sus dos vecinas se piden ya; el resto, cuando haga falta. Así la
 * foto de al lado está lista antes de pasar, y la pista del escenario y la del
 * visor no piden las cinco de entrada.
 *
 * Eso es lo único que logra: en escritorio la tira de miniaturas de
 * `AlbumStage` muestra las cinco a la vista con la MISMA URL grande (el backend
 * guarda una sola versión de cada foto, de hasta 1920 px de lado), así que al
 * entrar a un momento se bajan las cinco igual. En el celular la tira son
 * puntitos y esto sí ahorra. Se resuelve cuando el backend tenga miniaturas y
 * la tira use la chica.
 */
export const imageLoading = (index: number, current: number): 'eager' | 'lazy' =>
    Math.abs(index - current) <= 1 ? 'eager' : 'lazy'
