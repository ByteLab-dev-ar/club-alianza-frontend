import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    acceptGuardianInvitationAction,
    cancelGuardianInvitationAction,
    getGuardianInvitationAction,
    getMyGuardianInvitationsAction,
    inviteGuardianAction,
} from '../actions/guardian-invitations.actions'

export const useMyGuardianInvitations = () => {
    return useQuery({
        queryKey: [QK.guardianInvitations],
        queryFn: getMyGuardianInvitationsAction,
        staleTime: 1000 * 60,
    })
}

/**
 * La vista pública de una invitación. Sin reintentos: los tres motivos de fallo
 * —no existe, ya se usó, venció— son definitivos y devuelven el mismo 404, así
 * que reintentar solo gasta el rate limit del endpoint.
 */
export const useGuardianInvitationPreview = (token: string | undefined) => {
    return useQuery({
        queryKey: [QK.guardianInvitationPreview, token],
        queryFn: () => getGuardianInvitationAction(token!),
        enabled: !!token,
        retry: false,
    })
}

/**
 * Invitar a un segundo tutor.
 *
 * El toast usa el `message` del backend **tal cual**, y eso no es pereza: ese
 * texto está redactado para ser neutral —"si esa persona tiene cuenta, le va a
 * llegar la invitación; si no, le va a llegar una para crearla"— justamente
 * porque la pantalla no puede confirmar si el correo existe. Escribir acá un
 * "invitación enviada a María" sería el oráculo que el diseño evita.
 */
export const useInviteGuardian = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: inviteGuardianAction,
        onSuccess: (message) => {
            void queryClient.invalidateQueries({ queryKey: [QK.guardianInvitations] })
            notify.success(message || 'Invitación enviada.')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos enviar la invitación')),
    })
}

export const useCancelGuardianInvitation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: cancelGuardianInvitationAction,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [QK.guardianInvitations] })
            notify.success('Invitación cancelada')
        },
        // El 409 es "ya la aceptaron", y su mensaje explica que sacar a un tutor
        // se le pide al club. Se muestra tal cual.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos cancelarla')),
    })
}

/**
 * Aceptar. Recién acá nace el vínculo, y la persona queda responsable de la
 * cuota de esos chicos.
 *
 * El 409 distingue dos cosas —la invitación es para otro correo, o quien acepta
 * no es mayor de edad— y el 422 nombra qué datos propios le faltan. Los tres
 * mensajes vienen escritos y se muestran completos.
 */
export const useAcceptGuardianInvitation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: acceptGuardianInvitationAction,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [QK.memberWards] })
            notify.success('Listo, ya figurás como tutor.')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos aceptar la invitación')),
    })
}
