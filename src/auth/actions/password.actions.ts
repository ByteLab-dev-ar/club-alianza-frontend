import { clubApi } from '@/api/clubApi'

/**
 * POST /auth/forgot-password.
 * El backend siempre responde éxito, exista o no la cuenta (anti-enumeración de
 * usuarios): la UI no puede —ni debe— distinguir un caso del otro.
 */
export const forgotPasswordAction = async (email: string) => {
    await clubApi.post('/auth/forgot-password', { email })
}

/** POST /auth/reset-password con el token que llegó por mail. */
export const resetPasswordAction = async (token: string, newPassword: string) => {
    await clubApi.post('/auth/reset-password', { token, newPassword })
}

/** GET /auth/verify-email?token=... — activa la cuenta. */
export const verifyEmailAction = async (token: string) => {
    await clubApi.get('/auth/verify-email', { params: { token } })
}
