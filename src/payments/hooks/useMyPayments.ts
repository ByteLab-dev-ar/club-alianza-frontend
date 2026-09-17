import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    createCartPaymentAction,
    getCartAction,
    getMyPaymentsAction,
    getNextDueAction,
    getReceiptDocumentAction,
} from '../actions/payments.actions'
import { PaymentStatuses, type Payment } from '../interfaces/Payment'
import { latestMercadoPagoPayment } from '../lib/mercado-pago-return'

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

/*
 * Cuánto se espera al volver de Mercado Pago antes de dejar de preguntar.
 *
 * El aviso del proveedor llega por su lado y tarda unos segundos, así que el
 * pago puede seguir PENDING un rato después de que la persona ya volvió. Quince
 * segundos preguntando cada dos y medio alcanzan para el caso normal, y no
 * dejan la pestaña consultando para siempre si el aviso nunca llega.
 */
const RETURN_POLL_MS = 2500
const RETURN_WINDOW_MS = 15_000

/**
 * El pago de Mercado Pago que se acaba de intentar, mientras se confirma.
 *
 * **La fuente de verdad es el backend, no la URL.** Mercado Pago devuelve a la
 * pantalla de retorno con parámetros (`status`, `collection_status`,
 * `payment_id`), y esos los controla el navegador: alcanza con escribir la URL a
 * mano para "aprobarse" un pago. Acá no se lee ni uno.
 *
 * Cuál es el pago se deduce del propio historial —el más reciente hecho por este
 * medio—, que ya viene scopeado al socio de la sesión. Sin `external_reference`
 * ni nada que venga de afuera.
 */
export const useMercadoPagoReturn = () => {
    /*
     * Que se agotó la ventana es estado propio y no algo deducido de la query.
     *
     * Acá había un `fetchStatus === 'idle'`, que parece decir "ya no pregunta
     * más" y en realidad también es cierto ENTRE dos consultas: el cartel se
     * daba por vencido y volvía a esperar cada dos segundos y medio. Con un solo
     * timeout, el momento de rendirse pasa una vez y lo leen los dos lugares que
     * lo necesitan —cortar el polling y elegir el texto—.
     */
    const [gaveUpWaiting, setGaveUpWaiting] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setGaveUpWaiting(true), RETURN_WINDOW_MS)
        return () => clearTimeout(timer)
    }, [])

    const query = useQuery({
        queryKey: [QK.myPayments],
        queryFn: getMyPaymentsAction,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchInterval: (current) => {
            if (gaveUpWaiting) return false

            const payments = current.state.data
            if (!payments) return RETURN_POLL_MS

            const payment = latestMercadoPagoPayment(payments)
            // Resuelto —o directamente no hay ninguno— es no tener nada más que
            // esperar. Seguir preguntando solo gasta batería.
            if (!payment || payment.status !== PaymentStatuses.PENDING) return false

            return RETURN_POLL_MS
        },
    })

    const payment: Payment | undefined = latestMercadoPagoPayment(query.data ?? [])

    return {
        payment,
        isLoading: query.isLoading,
        isError: query.isError,
        /**
         * Sigue pendiente y ya no se pregunta más. **No es un error**: el pago
         * puede acreditarse igual cuando llegue el aviso, así que la pantalla
         * dice "estamos confirmando" y manda al historial.
         */
        gaveUpWaiting: gaveUpWaiting && payment?.status === PaymentStatuses.PENDING,
    }
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
        onSuccess: (payment) => {
            /*
             * Mercado Pago: redirigir es TODO lo que hay que hacer. No hay SDK
             * que cargar ni formulario embebido — el backend ya creó la
             * preferencia y esto es el link.
             *
             * Se sale sin invalidar ni avisar nada: la pestaña se va a otro
             * dominio, así que un toast no se llega a leer y un refetch se
             * cancela solo. Lo que corresponde lo hace la pantalla de retorno,
             * cuando la persona vuelve.
             *
             * Ojo: este pago puede ser uno que YA EXISTÍA. Si el socio abrió el
             * checkout y cerró la pestaña, reintentar la misma selección
             * devuelve el mismo pago con el mismo link en vez de crear otro.
             */
            if (payment.checkoutUrl) {
                window.location.href = payment.checkoutUrl
                return
            }

            notify.success('Comprobante enviado. Queda pendiente de aprobación.')
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
            notify.error(getApiErrorMessage(error, 'No pudimos subir el comprobante'))

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
