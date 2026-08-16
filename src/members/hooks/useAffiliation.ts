import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    cancelMembershipApplicationAction,
    getMyDocumentsAction,
    signAffiliationFormAction,
    submitMembershipApplicationAction,
    uploadSignedAffiliationFormAction,
} from '../actions/affiliation.actions'

/**
 * Todo lo que toca la afiliación mueve las mismas dos cosas: el estado del
 * trámite y qué documentos hay cargados. Va junto para que ningún camino se
 * olvide de uno de los dos — el checklist se arma con los dos a la vez, y con
 * uno viejo la pantalla pide algo que la persona acaba de subir.
 */
const useSyncAffiliation = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.memberProfile] })
        void queryClient.invalidateQueries({ queryKey: [QK.memberDocuments] })
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
            toast.success('Solicitud presentada. El club la va a revisar.')
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos presentar la solicitud')),
    })
}

export const useCancelMembershipApplication = () => {
    const syncAffiliation = useSyncAffiliation()
    return useMutation({
        mutationFn: cancelMembershipApplicationAction,
        onSuccess: () => {
            syncAffiliation()
            toast.success('Solicitud cancelada. Ya podés corregir tus datos.')
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos cancelar la solicitud')),
    })
}

export const useUploadSignedAffiliationForm = () => {
    const syncAffiliation = useSyncAffiliation()
    return useMutation({
        mutationFn: ({ profileId, file }: { profileId: string; file: File }) =>
            uploadSignedAffiliationFormAction(profileId, file),
        onSuccess: () => {
            syncAffiliation()
            toast.success('Ficha firmada subida correctamente')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir la ficha')),
    })
}

/** §1.4.b. Nunca se le dice "firma digital": es la *ficha firmada*. */
export const useSignAffiliationForm = () => {
    const syncAffiliation = useSyncAffiliation()
    return useMutation({
        mutationFn: ({ profileId, signature }: { profileId: string; signature: Blob }) =>
            signAffiliationFormAction(profileId, signature),
        onSuccess: () => {
            syncAffiliation()
            toast.success('Ficha firmada correctamente')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos firmar la ficha')),
    })
}
