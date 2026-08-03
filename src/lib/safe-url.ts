/**
 * Deja pasar solo URLs http/https, para usar en `href`.
 *
 * Los comprobantes y documentos se abren con la URL que devuelve la API. Hoy
 * las genera el storage del backend, pero el comprobante corresponde a un
 * archivo que sube el socio: si en algún refactor esa URL pasara a depender de
 * datos del usuario, un `javascript:...` se ejecutaría al hacer clic dentro de
 * la sesión de quien lo abre. Un `<img src>` es inerte ante eso; un `<a href>`
 * no. Cuesta nada y elimina la clase de bug entera.
 */
export const safeHttpUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined

    try {
        const { protocol } = new URL(url, window.location.origin)
        return protocol === 'http:' || protocol === 'https:' ? url : undefined
    } catch {
        return undefined
    }
}
