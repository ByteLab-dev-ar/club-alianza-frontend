import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { MyDocument } from '../interfaces/Affiliation'
import type { Credential } from '../interfaces/Credential'
import type { MemberProfile, UploadableDocumentType } from '../interfaces/MemberProfile'
import type { CreateWardPayload } from '../interfaces/Ward'
import type { UpdateProfilePayload } from './profile.actions'

/**
 * GET /members/wards — los chicos a cargo.
 *
 * Solo los VIGENTES, o sea los menores de 18. Las filas de los que crecieron no
 * se borran —son el registro de quién respondió por esa persona mientras fue
 * menor— pero dejan de listarse: a los 18 ya no dependen del tutor.
 */
export const getWardsAction = async () => {
    const response = await clubApi.get<ApiResponse<MemberProfile[]>>('/members/wards')
    return unwrap(response)
}

/**
 * POST /members/wards — cargar un menor.
 *
 * Queda en `REGISTERED`, no con la solicitud presentada: la documentación se
 * sube después y con la solicitud en revisión la ficha queda congelada. Se
 * presenta cuando está todo, igual que un adulto.
 *
 * El **422 nombra qué le falta al TUTOR**, no al chico: para afiliar a un menor
 * hay que ser mayor de edad y tener la identidad propia acreditada (nombre,
 * CUIL, DNI, correo, teléfono, domicilio y los dos lados del DNI). No hace
 * falta ser socio, y no se pide foto de perfil — sin credencial no cumpliría
 * ninguna finalidad.
 */
export const createWardAction = async (payload: CreateWardPayload) => {
    const response = await clubApi.post<ApiResponse<MemberProfile>>('/members/wards', payload)
    return unwrap(response)
}

/**
 * PATCH /members/wards/{profileId} — corregir los datos del tutelado.
 *
 * Rigen las mismas reglas que sobre la ficha propia: el CUIL y el DNI se setean
 * una sola vez, y con la solicitud en revisión la ficha queda congelada.
 */
export const updateWardAction = async (profileId: string, payload: UpdateProfilePayload) => {
    const response = await clubApi.patch<ApiResponse<MemberProfile>>(
        `/members/wards/${profileId}`,
        payload,
    )
    return unwrap(response)
}

/** GET /members/wards/{profileId}/documents — qué tiene cargado, sin bytes. */
export const getWardDocumentsAction = async (profileId: string) => {
    const response = await clubApi.get<ApiResponse<MyDocument[]>>(
        `/members/wards/${profileId}/documents`,
    )
    return unwrap(response)
}

export const uploadWardDocumentAction = async (
    profileId: string,
    type: UploadableDocumentType,
    file: File,
) => {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)

    await clubApi.post(`/members/wards/${profileId}/documents`, formData)
}

/**
 * POST /members/wards/{profileId}/photo.
 *
 * La foto del chico es obligatoria: va en la credencial que se escanea en la
 * puerta, y un socio sin foto tiene una credencial que no sirve para
 * identificarlo.
 */
export const uploadWardPhotoAction = async (profileId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await clubApi.post<ApiResponse<MemberProfile>>(
        `/members/wards/${profileId}/photo`,
        formData,
    )
    return unwrap(response)
}

export const submitWardApplicationAction = async (profileId: string) => {
    const response = await clubApi.post<ApiResponse<MemberProfile>>(
        `/members/wards/${profileId}/membership-application`,
    )
    return unwrap(response)
}

/**
 * DELETE — cancelar la solicitud del tutelado.
 *
 * A diferencia del resto, esto NO queda bloqueado por el congelamiento: si lo
 * estuviera, el chico quedaría trabado para siempre.
 */
export const cancelWardApplicationAction = async (profileId: string) => {
    const response = await clubApi.delete<ApiResponse<MemberProfile>>(
        `/members/wards/${profileId}/membership-application`,
    )
    return unwrap(response)
}

/**
 * PATCH /members/wards/{profileId}/player — el tutor SACA al chico de la
 * actividad.
 *
 * Solo desmarcar: mandar `isPlayer: true` responde 403, porque volver a marcarlo
 * es dar de alta a alguien en un cobro y eso lo decide el club. Por eso la
 * función no toma un booleano — un toggle acá sería una puerta a un 403.
 *
 * **No le quita lo ya pagado**: la cobertura de actividad corre hasta su
 * vencimiento, sin reembolsos ni cortes a mitad de período.
 */
export const unmarkWardAsPlayerAction = async (profileId: string) => {
    await clubApi.patch(`/members/wards/${profileId}/player`, { isPlayer: false })
}

/**
 * POST /members/wards/{profileId}/account — habilitarle la cuenta propia.
 *
 * **No crea un socio nuevo ni le copia el historial.** El chico ya es socio
 * desde el día uno —perfil, número, antigüedad, credencial y pagos—; lo único
 * que nunca tuvo es una cuenta para entrar, y esto se la engancha al perfil que
 * ya existe.
 *
 * Desde los 16 y con autorización del tutor. **A los 18 responde 409**: la
 * persona ya es adulta y la cuenta se la engancha el club.
 *
 * Tener cuenta no lo vuelve el deudor: hasta los 18 el obligado sigue siendo el
 * tutor.
 */
export const attachWardAccountAction = async (profileId: string, email: string) => {
    const response = await clubApi.post<ApiResponse<MemberProfile>>(
        `/members/wards/${profileId}/account`,
        { email },
    )
    return unwrap(response)
}

/**
 * GET /members/wards/{profileId}/credential.
 *
 * Para que el tutor se la muestre al chico desde su teléfono, o le mande una
 * captura: **el QR no vence**, así que esa imagen le sirve indefinidamente. Es
 * lo que hace que el menor no necesite cuenta propia para entrar a entrenar.
 *
 * Responde 403 mientras el chico no sea socio aprobado.
 */
export const getWardCredentialAction = async (profileId: string) => {
    const response = await clubApi.get<ApiResponse<Credential>>(
        `/members/wards/${profileId}/credential`,
    )
    return unwrap(response)
}
