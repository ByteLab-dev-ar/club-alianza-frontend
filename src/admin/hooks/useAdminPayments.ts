import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
    approvePaymentAction,
    getAdminPaymentsAction,
    rejectPaymentAction,
} from '../actions/payments.actions'
import type { AdminPaymentsQuery } from '../interfaces/AdminPayment'

const PAYMENTS_KEY = 'admin-payments'

export const useAdminPayments = (query: AdminPaymentsQuery) => {
    return useQuery({
        queryKey: [PAYMENTS_KEY, query],
        queryFn: () => getAdminPaymentsAction(query),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
    })
}

const useInvalidatePayments = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] })
        // Aprobar/rechazar cambia los números del dashboard (pendientes, ingresos).
        void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    }
}

export const useApprovePayment = () => {
    const invalidate = useInvalidatePayments()
    return useMutation({
        mutationFn: approvePaymentAction,
        onSuccess: invalidate,
    })
}

export const useRejectPayment = () => {
    const invalidate = useInvalidatePayments()
    return useMutation({
        mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
            rejectPaymentAction(paymentId, reason),
        onSuccess: invalidate,
    })
}
