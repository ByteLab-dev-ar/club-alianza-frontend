import { clubApi } from '@/api/clubApi'

/**
 * GET /auth/verify-email?token=… — activa la cuenta con el token del mail de
 * bienvenida. Vivía en password.actions.ts, donde nadie lo iba a buscar: no
 * tiene nada que ver con contraseñas.
 */
export const verifyEmailAction = async (token: string) => {
    await clubApi.get('/auth/verify-email', { params: { token } })
}
