/**
 * Cómo se llama el archivo que baja: `recibo-0000042.pdf`.
 *
 * Con ceros a la izquierda para que el explorador de archivos los ordene bien:
 * sin relleno, "recibo-10" va antes que "recibo-9" en cualquier carpeta, y el
 * tesorero que baja treinta recibos los ve mezclados.
 */
export const receiptPdfFileName = (receiptNumber: number): string =>
    `recibo-${String(receiptNumber).padStart(7, '0')}.pdf`

/**
 * Las dos rutas que devuelven el PDF del recibo del club.
 *
 * ⚠️ Ojo con los nombres, que es la confusión más fácil del módulo. Hay TRES
 * rutas parecidas y solo estas dos dan el papel del club:
 *
 * - `/payments/:id/receipt` → los BYTES de lo que subió quien pagó (la foto de
 *   la transferencia). Es del socio, no del club.
 * - `/payments/:id/receipt-document` → el JSON del recibo del club, que es lo
 *   que dibuja la pantalla.
 * - `/payments/:id/receipt-document/pdf` → ese mismo recibo, para imprimir.
 *
 * Van SIN el prefijo `/api`: son paths de endpoint como cualquier otro, así que
 * se piden con `fromApiBase: true` y resuelven contra el `baseURL` de `clubApi`.
 * Eso las hace independientes del proxy del dev-server.
 */
export const receiptPdfUrl = {
    /** El socio, sobre un pago propio. */
    forPayment: (paymentId: string) => `/payments/${paymentId}/receipt-document/pdf`,
    /** El mostrador, por id del RECIBO (no del pago). */
    forReceipt: (receiptId: string) => `/admin/counter/receipts/${receiptId}/pdf`,
} as const
