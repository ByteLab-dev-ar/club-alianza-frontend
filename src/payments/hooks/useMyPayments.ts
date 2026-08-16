import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    createCartPaymentAction,
    getCartAction,
    getMyPaymentsAction,
    getNextDueAction,
    getReceiptDocumentAction,
} from '../actions/payments.actions'

export const useMyPayments = () => {
    return useQuery({
        queryKey: [QK.myPayments],
        queryFn: getMyPaymentsAction,
        staleTime: 1000 * 60,
        // Acá había un `gcTime` corto y un `refetchOnWindowFocus` que existían
        // solo para renovar los `receiptUrl`: eran URLs firmadas que vencían a
        // los 5 minutos y quedaban muertas en el cache. Ahora el comprobante lo
        // sirve el backend por una URL estable que no vence (pide sesión), así
        // que no hay nada que renovar y valen los defaults.
    })
}

/**
 * Qué período le toca pagar. El servidor decide el mes y esta query es la única
 * fuente: la pantalla lo muestra en modo lectura. Sin cache a propósito — si
 * tesorería aprueba el comprobante pendiente mientras el socio navega, la
 * próxima visita a la pantalla tiene que ver el período nuevo.
 */
export const useNextDue = () => {
    return useQuery({
        queryKey: [QK.paymentsNextDue],
        queryFn: getNextDueAction,
        staleTime: 0,
        refetchOnMount: 'always',
    })
}

/**
 * A quiénes puede pagarles esta cuenta.
 *
 * Sin cache, por el mismo motivo que `useNextDue`: los precios, los meses y qué
 * está habilitado los decide el servidor, y una selección armada sobre datos
 * viejos termina en un 409 después de haber elegido el comprobante.
 */
export const useCart = () => {
    return useQuery({
        queryKey: [QK.paymentsCart],
        queryFn: getCartAction,
        staleTime: 0,
        refetchOnMount: 'always',
    })
}

/**
 * El recibo del club, para la pantalla que se imprime.
 *
 * Viene **congelado como se emitió**, así que se puede cachear largo sin riesgo:
 * un recibo que cambia no es un recibo. Lo único que se mueve es su `status`,
 * cuando el club lo anula — y para eso alcanza con volver a entrar.
 */
export const useReceiptDocument = (paymentId: string | undefined) => {
    return useQuery({
        queryKey: [QK.paymentReceipt, paymentId],
        queryFn: () => getReceiptDocumentAction(paymentId!),
        enabled: !!paymentId,
        staleTime: 1000 * 60 * 10,
    })
}

export const useCreateCartPayment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createCartPaymentAction,
        onSuccess: () => {
            toast.success('Comprobante enviado. Queda pendiente de aprobación.')
            void queryClient.invalidateQueries({ queryKey: [QK.myPayments] })
            void queryClient.invalidateQueries({ queryKey: [QK.memberProfile] })
            void queryClient.invalidateQueries({ queryKey: [QK.paymentsNextDue] })
            // Lo pagado deja de estar disponible: sin esto, la pantalla seguiría
            // ofreciendo los mismos conceptos que se acaban de mandar.
            void queryClient.invalidateQueries({ queryKey: [QK.paymentsCart] })
        },
        onError: (error) => {
            // Los mensajes del carrito nombran a la persona y el concepto
            // ("Tomás: para pagar la actividad tiene que tener la membresía al
            // día"). Con cuatro personas seleccionadas, un texto genérico no le
            // sirve a nadie, así que se muestran completos.
            toast.error(getApiErrorMessage(error, 'No pudimos subir el comprobante'))

            // Lo que se ofrecía quedó viejo: alguien pagó, o el mes cambió.
            void queryClient.invalidateQueries({ queryKey: [QK.paymentsCart] })
        },
    })
}

/*
 * Acá vivía `useCreatePayment`, el alta de a uno contra `POST /payments`. El
 * endpoint se retiró del backend: `useCreateCartPayment` es la única forma de
 * cargar un comprobante, y el socio pagando su propia membresía es ese mismo
 * carrito con una sola fila tildada.
 */
