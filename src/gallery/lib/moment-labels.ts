import { formatCalendarDate } from '@/lib/format'

/**
 * Los textos del dominio de la galería, en un solo lugar: "1 foto" / "N fotos"
 * estaba escrito a mano en el listado y en el detalle, y un plural suelto es
 * justo lo que diverge.
 */

export const MOMENT_DATE_PATTERN = "d 'de' MMMM 'de' yyyy"

/**
 * `date` es un día calendario ("YYYY-MM-DD"): pasa por `formatCalendarDate`,
 * nunca por `new Date()`, que lo lee como medianoche UTC y en Argentina
 * muestra el día anterior.
 */
export const formatMomentDate = (date: string | null): string | null =>
    date ? formatCalendarDate(date, MOMENT_DATE_PATTERN) : null

export const photoCountLabel = (count: number): string =>
    count === 1 ? '1 foto' : `${count} fotos`

export const momentCountLabel = (count: number): string =>
    count === 1 ? '1 momento' : `${count} momentos`

/** El botón de la portada. En singular no dice "las 1 fotos". */
export const viewPhotosLabel = (count: number): string =>
    count === 1 ? 'Ver la foto' : `Ver las ${count} fotos`

/**
 * La línea de datos del momento: "3 de septiembre de 2026 · 5 fotos". Sin
 * fecha queda solo lo otro, sin un separador colgado.
 */
export const momentMeta = (date: string | null, imageCount: number): string =>
    [formatMomentDate(date), imageCount > 0 ? photoCountLabel(imageCount) : 'Sin fotos todavía']
        .filter(Boolean)
        .join(' · ')

/**
 * El texto alternativo de cada foto. Las fotos no traen epígrafe, así que se
 * describen por el momento y su posición. Por índice del array y no por
 * `displayOrder + 1`: el orden puede tener huecos si se borró una foto.
 */
export const photoAlt = (title: string, index: number, total: number): string =>
    `${title} — foto ${index + 1} de ${total}`

export const photoCounter = (index: number, total: number): string => `${index + 1} de ${total}`

/**
 * El color de la categoría listo para un `style`.
 *
 * Lo elige quien administra desde el panel, así que se valida antes de
 * meterlo en el DOM: cualquier cosa que no sea `#RRGGBB` queda como una marca
 * vacía (con su filete), que es mejor que un valor roto o inyectado.
 */
export const safeCategoryColor = (color: string): string =>
    /^#[0-9a-f]{6}$/i.test(color) ? color : 'transparent'
