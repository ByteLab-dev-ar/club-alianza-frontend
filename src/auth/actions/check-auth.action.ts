import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { SessionUser } from '../interfaces/User'

/**
 * Única forma de saber si hay sesión —y con qué roles—: preguntarle al backend.
 * Las cookies son httpOnly, así que el JS del navegador no puede leerlas.
 */
export const checkAuthAction = async () => {
    const response = await clubApi.get<ApiResponse<SessionUser>>('/users/me')
    return unwrap(response)
}
