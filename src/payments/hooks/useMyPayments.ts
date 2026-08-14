import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    createCartPaymentAction,
    createPaymentAction,
    getCartAction,
    getMyPaymentsAction,
    getNextDueAction,
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

export const useCreatePayment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createPaymentAction,
        onSuccess: () => {
            toast.success('Comprobante enviado. Queda pendiente de aprobación.')
            void queryClient.invalidateQueries({ queryKey: [QK.myPayments] })
            // El pago entra en PENDING: todavía no cambia el estado de la cuota,
            // pero el perfil se refresca por si tesorería lo aprueba enseguida.
            void queryClient.invalidateQueries({ queryKey: [QK.memberProfile] })
            // El comprobante recién subido bloquea el período: canPay pasa a
            // false hasta que el club lo revise.
            void queryClient.invalidateQueries({ queryKey: [QK.paymentsNextDue] })
        },
        onError: (error) => {
            // El message del backend ya distingue las causas del 409 (cambió el
            // mes con la pantalla abierta, o ya hay un comprobante pendiente).
            toast.error(getApiErrorMessage(error, 'No pudimos subir el comprobante'))

            // Tras un 409, lo que muestra la pantalla quedó viejo: se vuelve a
            // consultar next-due para que el socio confirme contra la realidad.
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                void queryClient.invalidateQueries({ queryKey: [QK.paymentsNextDue] })
            }
        },
    })
}
