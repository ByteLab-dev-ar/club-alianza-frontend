import { format, formatDistanceToNow, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

const moneyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
})

export const formatMoney = (amount: number): string => moneyFormatter.format(amount)

/**
 * Fechas de calendario (fecha de pago, vencimiento, nacimiento, fecha de un evento).
 *
 * El backend las manda de dos formas según la columna: las `date` vienen como
 * 'YYYY-MM-DD' y las `timestamp` como '2026-07-14T00:00:00.000Z'. Formatear esta
 * última en horario local la corre un día para atrás en cualquier huso negativo
 * (Argentina es UTC-3: la medianoche UTC son las 21 del día anterior).
 *
 * Por eso se recorta a la parte de fecha ANTES de parsear: lo que se muestra es
 * siempre el día calendario que el backend guardó, sin traducción de huso.
 */
export const formatCalendarDate = (isoDate: string, pattern = 'dd/MM/yyyy'): string =>
    format(parseISO(isoDate.slice(0, 10)), pattern, { locale: es })

/** Fecha de calendario parseada, para cuentas (ej. antigüedad). */
export const parseCalendarDate = (isoDate: string): Date => parseISO(isoDate.slice(0, 10))

/**
 * Hoy, en `YYYY-MM-DD`, para mandárselo al backend como filtro de fechas.
 *
 * No es `new Date().toISOString().slice(0, 10)`: eso es el día **UTC**, y en
 * Argentina (UTC-3) a partir de las 21 hs devuelve el día siguiente. Con esa
 * versión, a las nueve de la noche la agenda daba por pasado el evento de esa
 * misma noche. Acá el día es el del reloj de quien mira la pantalla.
 */
export const todayIso = (): string => format(new Date(), 'yyyy-MM-dd')

/**
 * El día anterior a una fecha de calendario, en el mismo formato.
 *
 * Existe por los filtros de fecha del backend, que son inclusivos: para pedir
 * "lo que ya pasó" hay que cortar en ayer, porque con `endDate` en hoy el
 * evento de hoy caería a la vez en "lo que viene" y en "ya pasaron".
 */
export const previousDay = (isoDate: string): string =>
    format(subDays(parseCalendarDate(isoDate), 1), 'yyyy-MM-dd')

/** Período `YYYY-MM` de la cuota, como nombre de mes: "septiembre 2026". */
export const formatMonth = (month: string): string =>
    formatCalendarDate(`${month}-01`, 'MMMM yyyy')

/**
 * El período de un pago, listo para una celda de tabla.
 *
 * Tolera dos cosas que `formatMonth` no: el `metadataMonth` nulo (los pagos que
 * no son de cuota no tienen período) y un valor con forma inesperada. Esa segunda
 * guarda no es paranoia: `formatMonth` sobre una fecha inválida tira `RangeError`,
 * y al pasar por el render se lleva puesta la tabla entera por una sola celda.
 * Mostrar el valor crudo es mucho mejor que una pantalla de error.
 */
export const formatPaymentMonth = (month: string | null | undefined): string => {
    if (!month) return 'Cuota'

    return /^\d{4}-\d{2}$/.test(month) ? formatMonth(month) : month
}

/**
 * Hace cuánto pasó algo, en castellano: "hace 3 horas", "hace 2 días".
 *
 * Toma el instante completo y no `slice(0, 10)` como las de arriba: acá el
 * horario ES el dato. En la campana, "hace 5 minutos" y "hace 5 horas" caen el
 * mismo día y no significan lo mismo.
 */
export const formatTimeAgo = (isoDateTime: string): string =>
    formatDistanceToNow(parseISO(isoDateTime), { addSuffix: true, locale: es })

/**
 * El DNI con puntos de miles: `20001096` → `20.001.096`.
 *
 * Es como se escribe y como se dicta en la Argentina, y en una credencial que
 * alguien compara contra un documento de plástico, ocho dígitos corridos son
 * difíciles de seguir con el dedo.
 *
 * Devuelve el valor tal cual si no son solo dígitos: el padrón viene de una
 * importación y puede traer cualquier cosa adentro. Mejor mostrar lo que hay
 * que inventar un formato sobre un dato que no lo tiene.
 */
export const formatDni = (dni: string): string =>
    /^\d+$/.test(dni) ? dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : dni
