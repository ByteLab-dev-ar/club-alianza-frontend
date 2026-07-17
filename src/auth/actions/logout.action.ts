import { clubApi } from '@/api/clubApi'

/** Revoca el refreshToken en la base y borra las cookies de sesión del navegador. */
export const logoutAction = async () => {
    await clubApi.post('/auth/logout')
}
