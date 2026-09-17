import { useMutation, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    createBoardMemberAction,
    createMilestoneAction,
    deleteBoardMemberAction,
    deleteMilestoneAction,
    setBoardPeriodAction,
    updateBoardMemberAction,
    updateMilestoneAction,
    type BoardMemberPayload,
    type MilestonePayload,
} from '../actions/institutional.actions'

const useInvalidateHistory = () => {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: [QK.history] })
}

const useInvalidateBoard = () => {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: [QK.board] })
}

// --- Historia ---

export const useCreateMilestone = () => {
    const invalidate = useInvalidateHistory()
    return useMutation({ mutationFn: createMilestoneAction, onSuccess: invalidate })
}

export const useUpdateMilestone = (id: string) => {
    const invalidate = useInvalidateHistory()
    return useMutation({
        mutationFn: (payload: Partial<MilestonePayload>) => updateMilestoneAction(id, payload),
        onSuccess: invalidate,
    })
}

/** Ver la nota de useDeleteEvent: el feedback del borrado vive en el hook. */
export const useDeleteMilestone = () => {
    const invalidate = useInvalidateHistory()
    return useMutation({
        mutationFn: deleteMilestoneAction,
        onSuccess: () => {
            invalidate()
            notify.success('Hito eliminado')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos eliminar el hito')),
    })
}

// --- Comisión ---

export const useSetBoardPeriod = () => {
    const invalidate = useInvalidateBoard()
    return useMutation({ mutationFn: setBoardPeriodAction, onSuccess: invalidate })
}

export const useCreateBoardMember = () => {
    const invalidate = useInvalidateBoard()
    return useMutation({ mutationFn: createBoardMemberAction, onSuccess: invalidate })
}

export const useUpdateBoardMember = (id: string) => {
    const invalidate = useInvalidateBoard()
    return useMutation({
        mutationFn: (payload: Partial<BoardMemberPayload>) => updateBoardMemberAction(id, payload),
        onSuccess: invalidate,
    })
}

export const useDeleteBoardMember = () => {
    const invalidate = useInvalidateBoard()
    return useMutation({
        mutationFn: deleteBoardMemberAction,
        onSuccess: () => {
            invalidate()
            notify.success('Miembro eliminado')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos eliminar el miembro')),
    })
}
