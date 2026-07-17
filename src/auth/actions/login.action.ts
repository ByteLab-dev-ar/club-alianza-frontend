import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { LoginUser } from '../interfaces/User'

/**
 * El backend responde con Set-Cookie (accessToken + refreshToken, httpOnly).
 * No hay nada que guardar del lado del cliente.
 *
 * Devuelve un usuario recortado, sin `roles` — para saber el rol hay que
 * consultar GET /users/me (lo hace el store, justo después de esto).
 */
export const loginAction = async (email: string, password: string) => {
    const response = await clubApi.post<ApiResponse<LoginUser>>('/auth/login', {
        email,
        password,
    })
    return unwrap(response)
}
