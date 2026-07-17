import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { DocumentType, MemberProfile } from '../interfaces/MemberProfile'

export interface UpdateProfilePayload {
    name?: string
    surname?: string
    dni?: string
    phone?: string
    address?: string
    bornDate?: string
}

/** GET /members/profile — perfil propio (incluye name/surname, que /users/me no trae). */
export const getProfileAction = async () => {
    const response = await clubApi.get<ApiResponse<MemberProfile>>('/members/profile')
    return unwrap(response)
}

/**
 * PATCH /members/profile.
 * El DNI se puede setear UNA sola vez: si ya está cargado, el backend responde 409
 * (corregirlo es tarea de un admin).
 */
export const updateProfileAction = async (payload: UpdateProfilePayload) => {
    const response = await clubApi.patch<ApiResponse<MemberProfile>>('/members/profile', payload)
    return unwrap(response)
}

/** POST /members/profile-picture — multipart, máx 5MB (JPEG/PNG/WebP). */
export const uploadProfilePictureAction = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    // No se setea Content-Type a mano: el browser tiene que agregar el boundary
    // del multipart, y si lo pisamos, el backend no puede parsear el body.
    const response = await clubApi.post<ApiResponse<MemberProfile>>(
        '/members/profile-picture',
        formData,
    )
    return unwrap(response)
}

/**
 * POST /members/documents — multipart. Va a un bucket PRIVADO: no devuelve URL, y
 * el propio socio no puede volver a verlo (solo un admin, con URL firmada).
 */
export const uploadDocumentAction = async (type: DocumentType, file: File) => {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)

    await clubApi.post('/members/documents', formData)
}

/**
 * POST /members/email-change — no aplica el cambio: manda un mail de confirmación
 * al email NUEVO. Recién se aplica cuando se abre ese link.
 */
export const requestEmailChangeAction = async (newEmail: string) => {
    await clubApi.post('/members/email-change', { newEmail })
}
