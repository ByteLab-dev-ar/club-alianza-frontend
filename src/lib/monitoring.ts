/**
 * Registro de errores en producción (Sentry).
 *
 * Sin esto, un error de runtime en producción —el escáner que falla un sábado a
 * la noche en la puerta, un chunk que no baja— era invisible: nadie se enteraba
 * salvo que el usuario avisara.
 *
 * Todo cuelga de `VITE_SENTRY_DSN`. Si no está seteada (dev, o hasta que el
 * club cree la cuenta), este módulo es un no-op y el SDK NI SE DESCARGA: el
 * import es dinámico justamente para que los ~30 kB de Sentry no viajen en el
 * bundle de quien no lo usa.
 */

const dsn = import.meta.env.VITE_SENTRY_DSN

/** El SDK se carga una sola vez; las llamadas posteriores esperan esa carga. */
let sdkPromise: Promise<typeof import('@sentry/react')> | null = null

const loadSdk = () => {
    sdkPromise ??= import('@sentry/react')
    return sdkPromise
}

/**
 * Se llama una vez al arrancar (main.tsx). Al inicializarse, el SDK engancha
 * solo `window.onerror` y `unhandledrejection`, así que captura también los
 * errores que no pasan por ningún try/catch nuestro.
 */
export const initMonitoring = async (): Promise<void> => {
    if (!dsn) return

    const Sentry = await loadSdk()
    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        // Solo errores, sin tracing de performance: es lo que resuelve el
        // problema real (enterarse de las fallas) sin sumar peso ni ruido.
        // No se manda PII: el evento trae stack y URL, no datos del socio.
        sendDefaultPii: false,
    })
}

/**
 * Reporte manual, para los errores que la app SÍ atrapa y por eso nunca
 * llegarían a `window.onerror` (ej. el errorElement del router).
 */
export const reportError = (error: unknown): void => {
    if (!dsn) return

    void loadSdk().then((Sentry) => Sentry.captureException(error))
}
