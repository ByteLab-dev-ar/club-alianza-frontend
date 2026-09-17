import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    chargeAtCounterAction,
    getCounterPeopleAction,
    verifyReceiptAction,
    reissueReceiptAction,
    voidReceiptAction,
} from '../actions/counter.actions'

export const useCounterPeople = (profileId: string | undefined) => {
    return useQuery({
        queryKey: [QK.adminCounterPeople, profileId],
        queryFn: () => getCounterPeopleAction(profileId!),
        enabled: !!profileId,
        // Sin cache: entre que el tesorero busca a la familia y cobra pueden
        // pasar minutos, y lo que se decide con esto —qué está cubierto y qué
        // transferencias hay pendientes— cambia solo.
        staleTime: 0,
        refetchOnMount: 'always',
    })
}

/**
 * Cobrar en efectivo.
 *
 * Se invalida el padrón y los pagos porque el cobro acredita EN EL ACTO: la
 * cobertura del socio cambia en la misma request, no cuando alguien la valide
 * después.
 */
export const useChargeAtCounter = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: chargeAtCounterAction,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [QK.adminCounterPeople] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminMembers] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminPayments] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
        },
        // El 409 y el 422 nombran a quién y qué le falta —"esa cuota ya está
        // paga", "no hay monto cargado para ese concepto"—, y con una persona
        // esperando del otro lado del mostrador eso es exactamente lo que el
        // tesorero necesita leer.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos registrar el cobro')),
    })
}

/**
 * Verificar un recibo por su código.
 *
 * Sin reintentos: el 404 es definitivo —"ese código no corresponde a ningún
 * recibo del club"— y es el único caso que merece la palabra *inválido*.
 */
export const useVerifyReceipt = (code: string | undefined) => {
    return useQuery({
        queryKey: [QK.adminReceiptVerification, code],
        queryFn: () => verifyReceiptAction(code!),
        enabled: !!code,
        retry: false,
    })
}

/**
 * Anular un recibo, con el `id` que devuelve `verify/{code}`.
 *
 * `paymentReceipt` entra en la invalidación porque el recibo se cachea diez
 * minutos —viene congelado, no cambia—: lo único que se mueve es justamente
 * esto, y sin refrescarlo la pantalla del socio seguiría diciendo que vale.
 */
export const useVoidReceipt = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => voidReceiptAction(id, reason),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [QK.adminReceiptVerification] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminPayments] })
            void queryClient.invalidateQueries({ queryKey: [QK.paymentReceipt] })
            notify.success('Recibo anulado. Si hay que corregir, se emite uno nuevo.')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos anular el recibo')),
    })
}

/**
 * Corregir un recibo: anula el vigente y emite el reemplazo en un solo acto.
 *
 * Invalida las mismas claves que la anulación —el pago cambió de recibo
 * vigente, así que el listado y el documento cacheado quedaron viejos— y una
 * más: la verificación, porque el código que se está mirando pasó a estar
 * anulado.
 */
export const useReissueReceipt = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            reissueReceiptAction(id, reason),
        onSuccess: (nuevo) => {
            void queryClient.invalidateQueries({ queryKey: [QK.adminReceiptVerification] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminPayments] })
            void queryClient.invalidateQueries({ queryKey: [QK.paymentReceipt] })
            notify.success(`Listo: el recibo N° ${nuevo.number} reemplaza al anterior.`)
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos corregir el recibo')),
    })
}
