import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { ASSIGNABLE_ROLES, type Role } from '@/constants/roles'
import {
    createStaffAction,
    getUsersAction,
    inviteStaffAction,
    updateUserRolesAction,
} from '../actions/staff.actions'
import type { CreateStaffPayload, InviteStaffPayload, StaffUser } from '../interfaces/StaffUser'

const STAFF_KEY = QK.adminStaff

/**
 * El endpoint filtra por un solo rol por vez, así que para juntar a TODO el
 * personal se pide cada rol y se fusionan. Un usuario con varios roles aparece
 * en más de una respuesta, por eso se deduplica por id. El volumen es chico (no
 * son los ~3500 socios), así que traer todo va bien.
 *
 * Se recorren los roles ASIGNABLES y no los del panel: si no, las cuentas de
 * recepción quedaban fuera del listado y no había forma de editarlas.
 */
export const useStaff = () => {
    const results = useQueries({
        queries: ASSIGNABLE_ROLES.map((role) => ({
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
        onSuccess: () => {
            void invalidate()
            toast.success('Roles actualizados')
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos actualizar los roles')),
    })
}
