/**
 * La hora de un evento, lista para mostrar.
 *
 * `ClubEvent.time` es un `varchar(20)` sin formato en el backend: los DTO solo
 * piden texto de hasta 20 caracteres y el propio backend lo llama "texto
 * libre" al ordenar la agenda. El formulario del panel hoy exige HH:MM, pero
 * eso no cubre lo que ya está guardado (antes del regex cualquier texto
 * pasaba) ni lo que entra por otro lado. El evento de prueba "Borde: hora en
 * texto libre y lugar de 120" trae "De 10 a 18 hs", y las pantallas que
 * pegaban un " hs" al valor crudo lo mostraban como "De 10 a 18 hs hs".
 *
 * Así que el sufijo se agrega solo cuando el valor ES una hora (HH:MM, con
 * segundos opcionales porque el formulario del panel los acepta, y sin cero
 * adelante porque el backend cuenta con un "9:00" al ordenar). Cualquier otra
 * cosa se muestra tal cual la escribieron: si el club puso "De 10 a 18 hs",
 * "A confirmar" o "a las 16", esa frase ya se entiende sola y agregarle algo
 * la rompe.
 *
 * Toda pantalla que muestre la hora pasa por acá, incluida la próxima que se
 * sume: el " hs" pegado a mano llegó a estar copiado en la agenda de
 * `/eventos` (tarjetas y franja "El próximo"), en la lista de la portada y en
 * la tabla del panel, y un primer arreglo que cubrió solo algunas dejó el bug
 * vivo en las que vinieron después.
 *
 * Devuelve `null` —y no ''— cuando no hay hora (nula, vacía o puros
 * espacios), para que las pantallas sigan decidiendo con el mismo `&&` de
 * siempre si la línea va o no va.
 */
const HOUR_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

export const formatEventTime = (time: string | null | undefined): string | null => {
    const trimmed = time?.trim()
    if (!trimmed) return null

    return HOUR_PATTERN.test(trimmed) ? `${trimmed} hs` : trimmed
}
