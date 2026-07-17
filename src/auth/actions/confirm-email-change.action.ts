import { clubApi } from '@/api/clubApi'

/**
 * GET /auth/confirm-email-change?token=… — público: el link se manda al email
 * NUEVO, que puede abrirse sin sesión activa.
 */
export const confirmEmailChangeAction = async (token: string) => {
    await clubApi.get('/auth/confirm-email-change', { params: { token } })
}
