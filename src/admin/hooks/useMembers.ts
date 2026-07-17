import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    createMemberAction,
    deleteMemberAction,
    getMemberAction,
    getMembersAction,
    updateMemberAction,
} from '../actions/members.actions'
import type { AdminMembersQuery, UpdateMemberPayload } from '../interfaces/AdminMember'

const MEMBERS_KEY = 'admin-members'

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

/** Invalida todos los listados de socios tras una alta/edición/baja. */
const useInvalidateMembers = () => {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] })
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

export const useDeleteMember = () => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: deleteMemberAction,
        onSuccess: invalidate,
    })
}
