import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    createMemberAction,
    deleteMemberAction,
    getMemberAction,
    getMembersAction,
    revokeCredentialAction,
    updateMemberAction,
} from '../actions/members.actions'
import type { AdminMembersQuery, UpdateMemberPayload } from '../interfaces/AdminMember'

const MEMBERS_KEY = QK.adminMembers

export const useMembers = (query: AdminMembersQuery) => {
    return useQuery({
        queryKey: [MEMBERS_KEY, query],
        queryFn: () => getMembersAction(query),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
    })
}

export const useMember = (id: string | undefined) => {
    return useQuery({
        queryKey: [MEMBERS_KEY, 'detail', id],
        queryFn: () => getMemberAction(id!),
        enabled: !!id,
    })
}

/** Invalida los listados de socios y el dashboard tras una alta/edición/baja. */
const useInvalidateMembers = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] })
        // Altas y bajas mueven los contadores del dashboard (total, activos).
        void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
    }
}

export const useCreateMember = () => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: createMemberAction,
        onSuccess: invalidate,
    })
}

export const useUpdateMember = (id: string) => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: (payload: UpdateMemberPayload) => updateMemberAction(id, payload),
        onSuccess: invalidate,
    })
}

/**
 * Anula la credencial del socio sin darlo de baja. El toast usa el `message`
 * del backend, que explica que la tarjeta anterior dejó de servir y cómo sigue.
 */
export const useRevokeCredential = () => {
    return useMutation({
        mutationFn: revokeCredentialAction,
        onSuccess: ({ message }) => toast.success(message),
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos anular la credencial')),
    })
}

/** Ver la nota de useDeleteEvent: el feedback del borrado vive en el hook. */
export const useDeleteMember = () => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: deleteMemberAction,
        onSuccess: () => {
            invalidate()
            toast.success('Socio eliminado')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos eliminar al socio')),
    })
}
