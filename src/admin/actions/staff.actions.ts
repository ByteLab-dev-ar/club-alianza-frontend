import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse, Paginated } from '@/api/types'
import type { Role } from '@/constants/roles'
import type {
    CreateStaffPayload,
    InviteStaffPayload,
    StaffQuery,
    StaffUser,
} from '../interfaces/StaffUser'

/**
 * GET /admin/users — paginado. Sin filtros devuelve SOLO personal; ver StaffQuery
 * para los modos alternativos.
 */
export const getUsersAction = async (params: StaffQuery): Promise<Paginated<StaffUser>> => {
    const response = await clubApi.get<PaginatedResponse<StaffUser>>('/admin/users', { params })
    return unwrapPaginated(response)
}

/** POST /admin/users — alta directa con contraseña. Nunca cuenta como socio. */
export const createStaffAction = async (payload: CreateStaffPayload) => {
    const response = await clubApi.post<ApiResponse<StaffUser>>('/admin/users', payload)
    return unwrap(response)
}

/** POST /admin/users/invite — invitación por mail (sin contraseña; solo roles de staff). */
export const inviteStaffAction = async (payload: InviteStaffPayload) => {
    const response = await clubApi.post<ApiResponse<StaffUser>>('/admin/users/invite', payload)
    return unwrap(response)
}

/** PATCH /admin/users/:id/roles — reemplaza los roles. No reincorpora: ver reinstate. */
export const updateUserRolesAction = async (id: string, roles: Role[]) => {
    const response = await clubApi.patch<ApiResponse<StaffUser>>(`/admin/users/${id}/roles`, {
        roles,
    })
    return unwrap(response)
}

/**
 * DELETE /admin/users/:id — quita a alguien del personal.
 *
 * Pese al verbo, no borra nada. Le saca los roles del panel; si además es socio
 * conserva cuenta, cuota y credencial, y si no lo es la cuenta queda dada de
 * baja (sin el cargo no tiene razón de existir). La baja del club es otra cosa
 * y vive en la pantalla de Socios.
 */
export const removeFromStaffAction = async (id: string) => {
    const response = await clubApi.delete<ApiResponse<StaffUser>>(`/admin/users/${id}`)
    return unwrap(response)
}

/**
 * POST /admin/users/:id/reinstate — reactiva una cuenta dada de baja con los
 * roles que se le pasen. Hay que elegirlos sí o sí: la baja se los llevó.
 */
export const reinstateStaffAction = async (id: string, roles: Role[]) => {
    const response = await clubApi.post<ApiResponse<StaffUser>>(
        `/admin/users/${id}/reinstate`,
        { roles },
    )
    return unwrap(response)
}

/**
 * POST /admin/users/:id/resend-invite — manda un link nuevo de "configurá tu
 * contraseña" e invalida el anterior.
 *
 * A diferencia del resto, este endpoint ESPERA la respuesta del servicio de
 * mail antes de contestar: puede tardar un par de segundos y puede fallar con
 * 503 (transitorio, se reintenta).
 */
export const resendStaffInviteAction = async (id: string) => {
    const response = await clubApi.post<ApiResponse<{ email: string }>>(
        `/admin/users/${id}/resend-invite`,
    )
    return unwrap(response)
}
