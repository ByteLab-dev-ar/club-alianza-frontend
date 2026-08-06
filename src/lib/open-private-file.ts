import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

import { clubApi, getApiErrorMessage } from '@/api/clubApi'

/**
 * No se puede revocar en el acto: la pestaña todavía no cargó el blob. Un minuto
 * alcanza de sobra y evita que quede colgado en memoria hasta cerrar la app.
 */
const REVOKE_AFTER_MS = 60_000

/**
 * Reemplaza el cuerpo Blob de un error por el JSON que contiene.
 *
 * Con `responseType: 'blob'` axios envuelve TAMBIÉN los errores, así que el
 * `{ message }` que manda el backend queda dentro de un Blob y
 * `getApiErrorMessage` —que lo busca en `response.data.message`— no lo
 * encuentra. Normalizando el error acá, el resto de la app sigue leyendo los
 * errores igual que siempre, sin saber nada de blobs.
 *
 * Muta el error en vez de devolver uno nuevo a propósito: así conserva el
 * `isAxiosError`, el status y el config, que es lo que miran los llamadores.
 */
export const normalizeBlobError = async (error: unknown): Promise<void> => {
    if (!axios.isAxiosError(error) || !(error.response?.data instanceof Blob)) return

    try {
        error.response.data = JSON.parse(await error.response.data.text())
    } catch {
        // No era JSON (un 502 del proxy, por ejemplo, o un cuerpo vacío): se
        // deja como estaba y el mensaje de fallback se encarga.
    }
}

/**
 * Abre en una pestaña nueva un archivo privado que sirve el backend
 * (comprobantes de pago, documentos de identidad).
 *
 * Por qué no alcanza un `<a target="_blank">`: esos archivos salen por endpoints
 * que exigen la cookie de sesión, y una navegación del navegador NO pasa por el
 * interceptor de `clubApi`. Si el accessToken —que dura 15 minutos— está
 * vencido, el refresh transparente nunca corre y la pestaña nueva muestra un
 * JSON 401 crudo. Recargar tampoco lo arregla: el token sigue vencido hasta que
 * la app haga alguna llamada. Trayendo el archivo por axios, el refresh
 * participa y el clic se comporta como cualquier otra request.
 *
 * Lanza el error en vez de mostrarlo: quien llama decide cómo avisar. Para el
 * caso común está `useOpenPrivateFile`, que ya lo hace con un toast.
 */
export const openPrivateFile = async (path: string): Promise<void> => {
    // La pestaña se abre ANTES del await, a propósito: si se abriera después,
    // queda fuera del gesto del usuario y el navegador la bloquea.
    const tab = window.open('', '_blank')

    try {
        const { data } = await clubApi.get<Blob>(path, {
            // CRÍTICO: clubApi tiene baseURL = VITE_API_URL, y la ruta que manda
            // el backend YA incluye ese prefijo. Sin esto queda /api/api/... y da
            // 404. Con baseURL vacío anda en los dos entornos: en producción la
            // ruta es relativa y resuelve contra el origen de la página, y en
            // desarrollo el backend manda la URL absoluta a :3000, que axios usa
            // tal cual. Se sigue usando la instancia `clubApi` —y no un axios
            // pelado— porque lo que se busca es justamente su interceptor.
            baseURL: '',
            responseType: 'blob',
        })

        const objectUrl = URL.createObjectURL(data)

        if (tab) {
            tab.location.href = objectUrl
        } else {
            // El navegador bloqueó el popup igual: se cae a descarga, que no
            // necesita ventana nueva.
            const link = document.createElement('a')
            link.href = objectUrl
            link.download = ''
            link.click()
        }

        setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_AFTER_MS)
    } catch (error) {
        tab?.close()
        await normalizeBlobError(error)
        throw error
    }
}

/**
 * Envoltorio para los listados: recuerda QUÉ fila se está abriendo y muestra el
 * error con el toast de siempre.
 *
 * El estado por fila hace falta desde que el archivo se trae por axios: entre el
 * clic y la apertura hay una espera de red que con el `<a href>` no existía, y
 * sin feedback parece que el botón no hizo nada.
 */
export const useOpenPrivateFile = () => {
    const [openingId, setOpeningId] = useState<string | null>(null)

    /**
     * `path` se acepta nullable porque así llega de la API (`receiptUrl` es
     * `string | null`). Tomarlo estricto obligaba a un `!` en cada call site:
     * el chequeo del ternario que envuelve al botón no sobrevive dentro del
     * `onClick`, que es una closure y para TypeScript puede correr después.
     */
    const open = async (id: string, path: string | null | undefined) => {
        if (!path) return

        setOpeningId(id)
        try {
            await openPrivateFile(path)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos abrir el archivo'))
        } finally {
            setOpeningId(null)
        }
    }

    return { open, openingId }
}
