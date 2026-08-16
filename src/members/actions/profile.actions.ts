import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type {
    MemberProfile,
    MemberSex,
    MyMemberProfile,
    UploadableDocumentType,
} from '../interfaces/MemberProfile'

export interface UpdateProfilePayload {
    name?: string
    surname?: string
    cuil?: string
    dni?: string
    phone?: string
    address?: string
    bornDate?: string
    /** F, M o X, las tres del DNI. Es requisito de §1.5 para poder afiliarse. */
    sex?: MemberSex
}

/**
 * GET /members/profile — perfil propio.
 *
 * Devuelve MÁS que el PATCH: además de la ficha trae el trámite de afiliación
 * resuelto (`missingRequirements`, `canSubmitApplication`). Por eso el tipo es
 * `MyMemberProfile` y no `MemberProfile`, y por eso ninguna respuesta de PATCH
 * puede escribirse encima de este cache — ver `useProfile`.
 */
export const getProfileAction = async () => {
    const response = await clubApi.get<ApiResponse<MyMemberProfile>>('/members/profile')
    return unwrap(response)
}

/**
 * PATCH /members/profile.
 *
 * El DNI se puede setear UNA sola vez: si ya está cargado, el backend responde 409
 * (corregirlo es tarea de un admin). El CUIL, igual.
 *
 * Responde **409 mientras la solicitud está en revisión**: en `PENDING` la ficha
 * queda congelada (§1.8), porque si se pudiera editar cambiaría el domicilio
 * después de firmar y el papel dejaría de coincidir con el sistema. El camino
 * para corregir es cancelar la solicitud, editar y volver a presentarla.
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
 *
 * Solo acepta los dos lados del DNI. La ficha de afiliación firmada también es
 * un `MemberDocument`, pero **no entra por acá**: tiene sus dos endpoints
 * propios, uno por cada camino de firma (§1.4).
 *
 * Responde 409 en `PENDING`, y el corte va antes de la subida: el archivo ni
 * llega a R2.
 */
export const uploadDocumentAction = async (type: UploadableDocumentType, file: File) => {
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
