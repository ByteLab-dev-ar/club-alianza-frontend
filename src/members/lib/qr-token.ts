/**
 * El QR impreso contiene la URL completa (`${origin}/validar/${qrPayload}`),
 * así que hay que quedarse con el último segmento. Se acepta también un token
 * pelado por si alguna tarjeta vieja se imprimió sin la URL.
 *
 * Vive en un módulo propio (y no dentro de DoorScannerPage) para poder
 * testearlo sin montar el escáner.
 */
export const extractToken = (scanned: string): string | null => {
    const trimmed = scanned.trim()
    if (!trimmed) return null

    try {
        const { pathname } = new URL(trimmed)
        const match = pathname.match(/\/validar\/(.+)$/)
        return match?.[1] ?? null
    } catch {
        // No parsea como URL: puede ser el token solo.
        return trimmed.includes('/') ? null : trimmed
    }
}
