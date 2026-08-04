import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    approvePaymentAction,
    getAdminPaymentsAction,
    rejectPaymentAction,
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
        // Cada fila trae un `receiptUrl` firmado que vence a los 5 minutos, así
        // que la entrada se descarta antes de eso (mismo criterio que
        // useMemberDocuments). Sin el tope, `keepPreviousData` repintaba una
        // página ya visitada con links muertos mientras llegaba el refetch.
        gcTime: 1000 * 60 * 4,
        // Excepción deliberada al `refetchOnWindowFocus: false` global (ver
        // queryClient.ts): el comprobante se abre en una pestaña nueva, y volver
        // a la del club es justo el momento de refrescar los links antes del
        // próximo clic.
        refetchOnWindowFocus: true,
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
