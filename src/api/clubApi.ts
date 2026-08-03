import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, Paginated, PaginatedResponse } from './types'

/**
 * La sesión vive en cookies httpOnly (`accessToken` / `refreshToken`) que setea
 * el backend: no hay token en localStorage ni header Authorization que armar.
 * `withCredentials` es lo único que hace que el browser las mande en cada request.
 */
export const clubApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

/** Rutas donde un 401 es la respuesta esperada, no una sesión vencida. */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/register']

/**
 * Se emite cuando el refresh falla: la sesión está muerta y la UI tiene que
 * enterarse. Va por evento y no llamando al store porque esta capa no puede
 * importarlo (auth.store → actions → clubApi sería un ciclo).
 * Lo escucha auth.store.ts.
 */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

/**
 * Compara el pathname resuelto y no el string crudo: con `startsWith` sobre
 * `request.url`, el chequeo dependía de que cada action escribiera el path
 * relativo exacto, y `/auth/register` matcheaba de más contra cualquier ruta
 * que empezara igual.
 */
const skipsRefresh = (url: string | undefined): boolean => {
    if (!url) return false

    const base = clubApi.defaults.baseURL ?? window.location.origin
    const { pathname } = new URL(url, base)

    return NO_REFRESH_PATHS.some((path) => pathname === path || pathname.endsWith(path))
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

/** Mientras se refresca, el resto de las requests que fallaron esperan a este promise. */
let refreshPromise: Promise<unknown> | null = null

clubApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const request = error.config as RetriableRequest | undefined

        const isExpiredSession =
            error.response?.status === 401 &&
            request &&
            !request._retry &&
            !skipsRefresh(request.url)

        if (!isExpiredSession) return Promise.reject(error)

        // El accessToken dura 15 minutos: si venció, se renueva con el refreshToken
        // (que también viaja por cookie) y se reintenta la request original una sola vez.
        request._retry = true
        try {
            refreshPromise ??= clubApi.post('/auth/refresh').finally(() => {
                refreshPromise = null
            })
            await refreshPromise
            return clubApi(request)
        } catch {
            // Ni el refresh sirvió: no hay sesión que recuperar. Sin este aviso,
            // el store seguía en 'authenticated' y la persona quedaba mirando
            // errores en pantalla hasta recargar a mano.
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
            return Promise.reject(error)
        }
    },
)

/**
 * Desenvuelve el sobre `{ success, data, ... }` y devuelve solo `data`.
 *
 * Hay dos casos distintos que conviene no mezclar:
 *
 * - `success: false` con status 200. Hoy no puede pasar —lo garantiza el
 *   ResponseInterceptor del backend— así que esta rama es una red por si esa
 *   garantía se rompe.
 * - Respuesta SIN el campo `success`. Eso sí existe: hay endpoints marcados con
 *   `@IgnoreResponseInterceptor` que responden el payload crudo. Ahí el sobre
 *   no aplica y `envelope.data` sería `undefined`, así que se avisa distinto:
 *   no es una falla del servidor, es que esta action no debería usar `unwrap`.
 */
export const unwrap = <T>(response: { data: ApiResponse<T> }): T => {
    const envelope = response.data

    if (!envelope || typeof envelope.success !== 'boolean') {
        throw new Error('Esta respuesta no viene con el sobre estándar de la API')
    }

    if (!envelope.success) {
        throw new Error(envelope.message || 'El servidor devolvió una respuesta inesperada')
    }

    return envelope.data
}

/**
 * Junta el `data` (array) con el `meta` hermano en un `{ items, meta }`.
 * El backend los devuelve separados; para los hooks es más cómodo tenerlos juntos.
 */
export const unwrapPaginated = <T>(response: { data: PaginatedResponse<T> }): Paginated<T> => ({
    items: response.data.data,
    meta: response.data.meta,
})

/**
 * Mensaje de error legible para el usuario, viniendo de donde venga.
 *
 * Los errores del backend traen `message` (un string, ya en español) y, en los
 * 400 de validación, un `errors[]` con el detalle campo por campo. Cuando hay
 * varios campos inválidos se muestran todos: `message` solo trae el primero, y
 * corregir de a uno es una pésima experiencia.
 */
export const getApiErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
    if (axios.isAxiosError(error)) {
        if (!error.response) return 'No pudimos conectarnos con el servidor. Revisá tu conexión.'

        const body = error.response.data as Partial<ApiResponse<unknown>> | undefined

        const errors = Array.isArray(body?.errors) ? body.errors : []
        if (errors.length > 1) return errors.join(' · ')

        if (typeof body?.message === 'string' && body.message.length > 0) return body.message

        const [onlyError] = errors
        if (onlyError) return onlyError
    }
    return fallback
}
