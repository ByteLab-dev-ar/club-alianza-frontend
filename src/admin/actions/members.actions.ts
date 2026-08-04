import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse, Paginated } from '@/api/types'
import type {
    AdminMember,
    AdminMemberDocument,
    AdminMembersQuery,
    CreateMemberPayload,
    MemberImportJob,
    UpdateMemberPayload,
} from '../interfaces/AdminMember'

/** GET /admin/members — paginado, con búsqueda y filtro por estado. */
export const getMembersAction = async (
    query: AdminMembersQuery = {},
): Promise<Paginated<AdminMember>> => {
    const response = await clubApi.get<PaginatedResponse<AdminMember>>('/admin/members', {
        params: query,
    })
    return unwrapPaginated(response)
}

/** GET /admin/members/:id — detalle por profileId. */
export const getMemberAction = async (id: string) => {
    const response = await clubApi.get<ApiResponse<AdminMember>>(`/admin/members/${id}`)
    return unwrap(response)
}

/** POST /admin/members — crea User + MemberProfile; el socio recibe mail de bienvenida. */
export const createMemberAction = async (payload: CreateMemberPayload) => {
    const response = await clubApi.post<ApiResponse<AdminMember>>('/admin/members', payload)
    return unwrap(response)
}

/** PATCH /admin/members/:id — incluye campos de gestión (nº socio, vencimiento, dni). */
export const updateMemberAction = async (id: string, payload: UpdateMemberPayload) => {
    const response = await clubApi.patch<ApiResponse<AdminMember>>(`/admin/members/${id}`, payload)
    return unwrap(response)
}

/** DELETE /admin/members/:id — soft delete + revoca el acceso al portal. */
export const deleteMemberAction = async (id: string) => {
    await clubApi.delete(`/admin/members/${id}`)
}

/**
 * POST /admin/members/:id/revoke-credential — el caso "perdí la tarjeta".
 *
 * Sube la versión de la credencial: el QR impreso (y cualquier captura) deja de
 * validar en la puerta al instante, sin dar de baja al socio. La próxima vez
 * que abra la app se le firma uno nuevo.
 *
 * Devuelve también el `message` del sobre porque es el texto que se le muestra
 * al admin — lo redacta el backend y explica qué pasa ahora.
 */
export const revokeCredentialAction = async (id: string) => {
    const response = await clubApi.post<ApiResponse<{ credentialVersion: number }>>(
        `/admin/members/${id}/revoke-credential`,
    )

    return {
        credentialVersion: unwrap(response).credentialVersion,
        message: response.data.message,
    }
}

/** GET /admin/members/:id/documents — documentos privados con URL firmada (solo ADMIN). */
export const getMemberDocumentsAction = async (id: string) => {
    const response = await clubApi.get<ApiResponse<AdminMemberDocument[]>>(
        `/admin/members/${id}/documents`,
    )
    return unwrap(response)
}

/** POST /admin/members/bulk-import — sube el CSV y responde al toque con el jobId. */
export const bulkImportMembersAction = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await clubApi.post<ApiResponse<MemberImportJob>>(
        '/admin/members/bulk-import',
        formData,
    )
    return unwrap(response)
}

/** GET /admin/members/bulk-import/:jobId — estado del import (para hacer polling). */
export const getBulkImportStatusAction = async (jobId: string) => {
    const response = await clubApi.get<ApiResponse<MemberImportJob>>(
        `/admin/members/bulk-import/${jobId}`,
    )
    return unwrap(response)
}

/**
 * POST /admin/members/bulk-import/:jobId/retry-emails — reintenta las
 * bienvenidas que no salieron en una importación.
 *
 * Responde ENSEGUIDA con el job todavía sin cambios: el envío sigue en segundo
 * plano. El avance se ve con el GET de arriba, donde `emailFailures` se va
 * vaciando (el backend lo persiste cada 25 correos). El `status` del job queda
 * en `done` todo el tiempo, así que no sirve para saber si el reenvío terminó.
 */
export const retryImportEmailsAction = async (jobId: string) => {
    const response = await clubApi.post<ApiResponse<MemberImportJob>>(
        `/admin/members/bulk-import/${jobId}/retry-emails`,
    )
    return unwrap(response)
}

/**
 * POST /admin/members/:id/resend-welcome — le manda al socio un link nuevo para
 * configurar su contraseña.
 *
 * A diferencia del reintento masivo, este ESPERA la confirmación del servicio de
 * mail antes de responder: puede tardar un par de segundos y puede fallar con
 * 503, que es transitorio y se reintenta.
 */
export const resendWelcomeAction = async (id: string) => {
    const response = await clubApi.post<ApiResponse<{ email: string }>>(
        `/admin/members/${id}/resend-welcome`,
    )
    return unwrap(response)
}
