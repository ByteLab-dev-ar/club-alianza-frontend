import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    chargeAtCounterAction,
    getCounterPeopleAction,
    verifyReceiptAction,
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
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos registrar el cobro')),
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

export const useVoidReceipt = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => voidReceiptAction(id, reason),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [QK.adminReceiptVerification] })
            void queryClient.invalidateQueries({ queryKey: [QK.adminPayments] })
            toast.success('Recibo anulado. Si hay que corregir, se emite uno nuevo.')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos anular el recibo')),
    })
}
