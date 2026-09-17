import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    approveApplicationAction,
    getApplicationsAction,
    rejectApplicationAction,
    type ApplicationsQuery,
} from '../actions/applications.actions'

export const useApplications = (query: ApplicationsQuery) => {
    return useQuery({
        queryKey: [QK.adminApplications, query],
        queryFn: () => getApplicationsAction(query),
        placeholderData: keepPreviousData,
        // Corto a propósito: es una cola compartida entre administradores, y con
        // la bandeja abierta un rato la persona ya puede haber cancelado su
        // solicitud —lo que hace que aprobar responda 409—.
        staleTime: 1000 * 30,
    })
}

/**
 * Resolver una solicitud la saca de la bandeja y mueve el padrón: al aprobar
 * entra un socio nuevo con su número, y al rechazar vuelve a Registrado. Los
 * contadores del dashboard cuentan socios, así que también se enteran.
 */
const useInvalidateApplications = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.adminApplications] })
        void queryClient.invalidateQueries({ queryKey: [QK.adminMembers] })
        void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
    }
}

export const useApproveApplication = () => {
    const invalidate = useInvalidateApplications()
    return useMutation({
        mutationFn: approveApplicationAction,
        onSuccess: (member) => {
            invalidate()
            notify.success(
                member.memberNumber
                    ? `Solicitud aprobada. Es el socio N° ${member.memberNumber}.`
                    : 'Solicitud aprobada.',
            )
        },
        // El 409 distingue "ya es socio" de "canceló la solicitud mientras
        // tenías la bandeja abierta", y las dos son información útil: se
        // muestran tal cual.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos aprobar la solicitud')),
    })
}

export const useRejectApplication = () => {
    const invalidate = useInvalidateApplications()
    return useMutation({
        mutationFn: ({ profileId, reason }: { profileId: string; reason: string }) =>
            rejectApplicationAction(profileId, reason),
        onSuccess: () => {
            invalidate()
            notify.success('Solicitud rechazada. La persona ve el motivo y puede corregir.')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos rechazar la solicitud')),
    })
}
