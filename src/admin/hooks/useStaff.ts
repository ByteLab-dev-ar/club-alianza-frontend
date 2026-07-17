import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'

import { STAFF_ROLES, type Role } from '@/constants/roles'
import {
    createStaffAction,
    getUsersAction,
    inviteStaffAction,
    updateUserRolesAction,
} from '../actions/staff.actions'
import type { CreateStaffPayload, InviteStaffPayload, StaffUser } from '../interfaces/StaffUser'

const STAFF_KEY = 'admin-staff'

/**
 * El endpoint filtra por un solo rol por vez, así que para juntar a TODO el staff
 * (admin + tesorería + web_admin) se piden los tres y se fusionan. Un usuario con
 * varios roles aparece en más de una respuesta, por eso se deduplica por id.
 * El volumen de staff es chico (no son los ~3500 socios), así que traer todo va bien.
 */
export const useStaff = () => {
    const results = useQueries({
        queries: STAFF_ROLES.map((role) => ({
            queryKey: [STAFF_KEY, role],
            queryFn: () => getUsersAction({ role, limit: 100 }),
            staleTime: 1000 * 30,
        })),
    })

    const isLoading = results.some((result) => result.isLoading)
    const isError = results.some((result) => result.isError)

    const byId = new Map<string, StaffUser>()
    for (const result of results) {
        for (const user of result.data?.items ?? []) {
            byId.set(user.id, user)
        }
    }
    const staff = [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return { staff, isLoading, isError }
}

const useInvalidateStaff = () => {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
}

export const useCreateStaff = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: (payload: CreateStaffPayload) => createStaffAction(payload),
        onSuccess: invalidate,
    })
}

export const useInviteStaff = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: (payload: InviteStaffPayload) => inviteStaffAction(payload),
        onSuccess: invalidate,
    })
}

export const useUpdateUserRoles = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
            updateUserRolesAction(id, roles),
        onSuccess: invalidate,
    })
}
