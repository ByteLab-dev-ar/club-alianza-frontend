import { format, parseISO } from 'date-fns'
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

/** Período `YYYY-MM` de la cuota, como nombre de mes: "septiembre 2026". */
export const formatMonth = (month: string): string =>
    formatCalendarDate(`${month}-01`, 'MMMM yyyy')
