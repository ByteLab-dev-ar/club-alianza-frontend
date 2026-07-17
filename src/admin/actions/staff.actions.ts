import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse, Paginated } from '@/api/types'
import type { Role } from '@/constants/roles'
import type { CreateStaffPayload, InviteStaffPayload, StaffUser } from '../interfaces/StaffUser'

/** GET /admin/users — paginado, filtrable por rol. */
export const getUsersAction = async (params: {
    page?: number
    limit?: number
    role?: Role
    search?: string
}): Promise<Paginated<StaffUser>> => {
    const response = await clubApi.get<PaginatedResponse<StaffUser>>('/admin/users', { params })
    return unwrapPaginated(response)
}

/** POST /admin/users — alta directa con contraseña. */
export const createStaffAction = async (payload: CreateStaffPayload) => {
    const response = await clubApi.post<ApiResponse<StaffUser>>('/admin/users', payload)
    return unwrap(response)
}

/** POST /admin/users/invite — invitación por mail (sin contraseña; solo roles de staff). */
export const inviteStaffAction = async (payload: InviteStaffPayload) => {
    const response = await clubApi.post<ApiResponse<StaffUser>>('/admin/users/invite', payload)
    return unwrap(response)
}

/** PATCH /admin/users/:id/roles — reemplaza los roles de un usuario. */
export const updateUserRolesAction = async (id: string, roles: Role[]) => {
    const response = await clubApi.patch<ApiResponse<StaffUser>>(`/admin/users/${id}/roles`, {
        roles,
    })
    return unwrap(response)
}
