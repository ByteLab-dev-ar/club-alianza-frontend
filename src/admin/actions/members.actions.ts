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
