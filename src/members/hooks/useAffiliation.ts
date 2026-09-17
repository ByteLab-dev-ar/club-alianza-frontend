import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    cancelMembershipApplicationAction,
    getMyDocumentsAction,
    signAffiliationFormAction,
    submitMembershipApplicationAction,
} from '../actions/affiliation.actions'

/**
 * Todo lo que toca la afiliación mueve las mismas dos cosas: el estado del
 * trámite y qué documentos hay cargados. Va junto para que ningún camino se
 * olvide de uno de los dos — el checklist se arma con los dos a la vez, y con
 * uno viejo la pantalla pide algo que la persona acaba de subir.
 *
 * La ficha firmada es la excepción que obliga a pasar el `profileId`: es el
 * único trámite que un adulto hace **sobre otra persona** (§1.4, "la ficha la
 * puede subir la persona o el club"), y el tutor la firma desde la pantalla del
 * chico. Con solo las claves propias, el "Firmada el 14/08" del tutelado no
 * aparecía hasta recargar. Sobre el perfil propio esas dos invalidaciones no
 * matchean ninguna query y no cuestan nada.
 */
const useSyncAffiliation = () => {
    const queryClient = useQueryClient()
    return (profileId?: string) => {
        void queryClient.invalidateQueries({ queryKey: [QK.memberProfile] })
        void queryClient.invalidateQueries({ queryKey: [QK.memberDocuments] })

        if (profileId) {
            void queryClient.invalidateQueries({ queryKey: [QK.wardProfile, profileId] })
            void queryClient.invalidateQueries({ queryKey: [QK.wardDocuments, profileId] })
        }
    }
}

export const useMyDocuments = () => {
    return useQuery({
        queryKey: [QK.memberDocuments],
        queryFn: getMyDocumentsAction,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * El 422 nombra qué falta, y el 409 distingue "ya hay una pendiente" de "ya sos
 * socio". Los dos se muestran tal cual: son mensajes escritos para leer, no
 * ruido que haya que traducir a un toast genérico.
 */
export const useSubmitMembershipApplication = () => {
    const syncAffiliation = useSyncAffiliation()
    return useMutation({
        mutationFn: submitMembershipApplicationAction,
        onSuccess: () => {
            syncAffiliation()
            notify.success('Solicitud presentada. El club la va a revisar.')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos presentar la solicitud')),
    })
}

export const useCancelMembershipApplication = () => {
    const syncAffiliation = useSyncAffiliation()
    return useMutation({
        mutationFn: cancelMembershipApplicationAction,
        onSuccess: () => {
            syncAffiliation()
            notify.success('Solicitud cancelada. Ya podés corregir tus datos.')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos cancelar la solicitud')),
    })
}

/*
 * Acá vivía `useUploadSignedAffiliationForm`. Se fue con su acción: §1.4 sacó la
 * subida de la ficha en papel del lado del socio —el papel entra por la sede— y
 * el endpoint se mudó al panel. Ver la nota en `affiliation.actions.ts`.
 */

/** §1.4.b. Nunca se le dice "firma digital": es la *ficha firmada*. */
export const useSignAffiliationForm = () => {
    const syncAffiliation = useSyncAffiliation()
    return useMutation({
        mutationFn: ({ profileId, signature }: { profileId: string; signature: Blob }) =>
            signAffiliationFormAction(profileId, signature),
        onSuccess: (_data, { profileId }) => {
            syncAffiliation(profileId)
            notify.success('Ficha firmada correctamente')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos firmar la ficha')),
    })
}
