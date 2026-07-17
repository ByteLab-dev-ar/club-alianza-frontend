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
            !NO_REFRESH_PATHS.some((path) => request.url?.startsWith(path))

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
            return Promise.reject(error)
        }
    },
)

/** Desenvuelve el sobre `{ success, data, ... }` y devuelve solo `data`. */
export const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data

/**
 * Junta el `data` (array) con el `meta` hermano en un `{ items, meta }`.
 * El backend los devuelve separados; para los hooks es más cómodo tenerlos juntos.
 */
export const unwrapPaginated = <T>(response: { data: PaginatedResponse<T> }): Paginated<T> => ({
    items: response.data.data,
    meta: response.data.meta,
})

/** Mensaje de error legible para el usuario, viniendo de donde venga. */
export const getApiErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
    if (axios.isAxiosError(error)) {
        const message = (error.response?.data as Partial<ApiResponse<unknown>> | undefined)?.message
        if (Array.isArray(message)) return message.join(', ')
        if (typeof message === 'string' && message.length > 0) return message
        if (!error.response) return 'No pudimos conectarnos con el servidor. Revisá tu conexión.'
    }
    return fallback
}
