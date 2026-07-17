import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { LoginUser } from '../interfaces/User'

export interface RegisterPayload {
    name: string
    surname: string
    email: string
    password: string
}

/** El usuario queda inactivo hasta que verifica el mail (no inicia sesión). */
export const registerAction = async (payload: RegisterPayload) => {
    const response = await clubApi.post<ApiResponse<LoginUser>>('/auth/register', payload)
    return unwrap(response)
}
