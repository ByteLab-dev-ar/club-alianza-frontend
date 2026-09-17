/*
 * Cuánto dura un toast según lo que hay que leer.
 *
 * Los 4 s fijos de sonner alcanzan para "Perfil actualizado" pero no para
 * "Recibo anulado. Si hay que corregir, se emite uno nuevo.", ni para un 400
 * de validación que getApiErrorMessage junta con " · " (tres errores rondan
 * los 150 caracteres): ese toast se iba antes de terminar de leerlo.
 *
 * 60 ms por carácter es una lectura tranquila en español, y los 2 s de base
 * son para darse cuenta de que apareció algo. El piso deja igual que hoy todo
 * lo de 33 caracteres o menos (92 de los 124 literales de la app); el techo
 * existe porque lo que no se lee en 10 s no debería ser un aviso que se va
 * solo, y la pausa al pasar el mouse cubre el resto.
 *
 * No importa sonner a propósito: es la regla sola, y su spec corre en node
 * sin cargar React.
 */
const MIN_MS = 4000
const BASE_MS = 2000
const MS_PER_CHAR = 60
const MAX_MS = 10000

export const toastDuration = (title: string, description?: string): number => {
    const chars = title.length + (description?.length ?? 0)
    const ms = Math.round((BASE_MS + chars * MS_PER_CHAR) / 100) * 100
    return Math.min(MAX_MS, Math.max(MIN_MS, ms))
}

interface DurationOptions {
    description?: string | undefined
    duration?: number | undefined
}

/*
 * Un `duration` explícito gana siempre. El aviso de aprobación que no movió el
 * vencimiento es Infinity a propósito (useAdminPayments.ts): si la fórmula lo
 * pisara, se volvería a ir solo y a pasar desapercibido.
 */
export const resolveToastDuration = (title: string, { description, duration }: DurationOptions = {}): number =>
    duration ?? toastDuration(title, description)
