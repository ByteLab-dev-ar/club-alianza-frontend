import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    approvePaymentAction,
    getAdminPaymentsAction,
    rejectPaymentAction,
} from '../actions/payments.actions'
import type { AdminPaymentsQuery } from '../interfaces/AdminPayment'

const PAYMENTS_KEY = QK.adminPayments

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
        // Marca stale todas las páginas de pagos, pero refetchea solo las que
        // están montadas — que es la página actual. Es el default de
        // `refetchType: 'active'`: el resto se recarga recién si se vuelve a
        // ellas, sin traer el set completo de una.
        void queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] })
        // Aprobar/rechazar cambia los números del dashboard (pendientes, ingresos).
        void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
        // Aprobar también corre el vencimiento y el estado del socio: la
        // invalidación por prefijo cubre listado y detalle a la vez.
        void queryClient.invalidateQueries({ queryKey: [QK.adminMembers] })
    }
}

export const useApprovePayment = () => {
    const invalidate = useInvalidatePayments()
    return useMutation({
        mutationFn: approvePaymentAction,
        onSuccess: () => {
            invalidate()
            toast.success('Pago aprobado. Se actualizó el vencimiento del socio.')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos aprobar el pago')),
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
