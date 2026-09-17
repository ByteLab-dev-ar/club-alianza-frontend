import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import type { PaymentConcept } from '@/payments/interfaces/Payment'
import { notify } from '@/lib/notify'
import {
    createFeeAction,
    deleteFeeAction,
    getCurrentFeesAction,
    getFeesAction,
    updateFeeAction,
} from '../actions/fees.actions'

export const useFees = (concept?: PaymentConcept) => {
    return useQuery({
        queryKey: [QK.adminFees, concept ?? 'all'],
        queryFn: () => getFeesAction(concept),
        staleTime: 1000 * 60,
    })
}

export const useCurrentFees = () => {
    return useQuery({
        queryKey: [QK.adminCurrentFees],
        queryFn: getCurrentFeesAction,
        staleTime: 1000 * 60,
    })
}

const useInvalidateFees = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.adminFees] })
        void queryClient.invalidateQueries({ queryKey: [QK.adminCurrentFees] })
    }
}

export const useCreateFee = () => {
    const invalidate = useInvalidateFees()
    return useMutation({
        mutationFn: createFeeAction,
        onSuccess: invalidate,
    })
}

export const useUpdateFee = () => {
    const invalidate = useInvalidateFees()
    return useMutation({
        mutationFn: ({ id, amount }: { id: string; amount: number }) => updateFeeAction(id, amount),
        onSuccess: invalidate,
    })
}

export const useDeleteFee = () => {
    const invalidate = useInvalidateFees()
    return useMutation({
        mutationFn: deleteFeeAction,
        onSuccess: () => {
            invalidate()
            notify.success('Monto eliminado')
        },
        // El 409 es "ese monto ya está rigiendo", y su mensaje explica que para
        // cobrar otro importe se carga uno nuevo desde el mes que viene.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos eliminar el monto')),
    })
}
