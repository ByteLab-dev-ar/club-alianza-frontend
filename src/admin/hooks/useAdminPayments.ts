import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    approvePaymentAction,
    getAdminPaymentsAction,
    rejectPaymentAction,
    revertPaymentAction,
} from '../actions/payments.actions'
import { approvalNotice } from '../lib/payment-approval'
import type { AdminPaymentsQuery } from '../interfaces/AdminPayment'

const PAYMENTS_KEY = QK.adminPayments

export const useAdminPayments = (query: AdminPaymentsQuery) => {
    return useQuery({
        queryKey: [PAYMENTS_KEY, query],
        queryFn: () => getAdminPaymentsAction(query),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
        // Acá había un `gcTime` corto y un `refetchOnWindowFocus` para que
        // `keepPreviousData` no repintara una página ya visitada con
        // `receiptUrl` firmados y vencidos. El backend ahora sirve el
        // comprobante por una URL estable que no vence, así que el cache puede
        // comportarse como el de cualquier otro listado.
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
        onSuccess: (payment) => {
            invalidate()

            const notice = approvalNotice(payment)
            if (notice.tone === 'warning') {
                // Sin auto-cierre: un toast que se va a los 4 segundos es
                // exactamente lo que hace que un pago que no otorgó nada pase
                // desapercibido. El Toaster ya trae botón de cierre.
                toast.warning(notice.title, {
                    description: notice.description,
                    duration: Infinity,
                })
                return
            }

            toast.success(notice.title)
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

/**
 * Revertir un pago aprobado.
 *
 * Le alcanza con la misma invalidación que aprobar y por el mismo motivo, al
 * revés: mueve los ingresos del dashboard y **recalcula la cobertura del socio**,
 * así que el padrón que quedó en cache está mintiendo sobre hasta cuándo está al
 * día. El motivo es obligatorio (mínimo 10 caracteres, lo valida el backend).
 */
export const useRevertPayment = () => {
    const invalidate = useInvalidatePayments()
    return useMutation({
        mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
            revertPaymentAction(paymentId, reason),
        onSuccess: invalidate,
    })
}
