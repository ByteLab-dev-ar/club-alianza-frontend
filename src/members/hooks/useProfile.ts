import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { getCredentialAction } from '../actions/get-credential.action'
import {
    getProfileAction,
    requestEmailChangeAction,
    updateProfileAction,
    uploadDocumentAction,
    uploadProfilePictureAction,
} from '../actions/profile.actions'
import type { DocumentType, MemberProfile } from '../interfaces/MemberProfile'

export const useProfile = () => {
    return useQuery({
        queryKey: [QK.memberProfile],
        queryFn: getProfileAction,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * El backend firma un token nuevo en CADA llamada, y el anterior sigue valiendo
 * hasta su propio vencimiento. Por eso no se cachea: entrar a la pantalla de
 * credencial tiene que traer siempre el token más fresco, para que la captura
 * que el socio se guarde en el celular dure lo máximo posible.
 */
export const useCredential = () => {
    return useQuery({
        queryKey: [QK.memberCredential],
        queryFn: getCredentialAction,
        staleTime: 0,
        refetchOnMount: 'always',
    })
}

/**
 * El perfil recién guardado viene en la respuesta, así que se escribe directo en
 * el cache en vez de refetchear. La credencial sí se invalida: muestra nombre,
 * apellido, DNI y foto, y con su staleTime de 5 minutos quedaría desactualizada.
 */
const useSyncProfile = () => {
    const queryClient = useQueryClient()
    return (updated: MemberProfile) => {
        queryClient.setQueryData([QK.memberProfile], updated)
        void queryClient.invalidateQueries({ queryKey: [QK.memberCredential] })
    }
}

/**
 * Sin `onError` a propósito: quien lo usa mapea el 409 de DNI duplicado al campo
 * (ver ProfileForm), que es más útil que un toast genérico.
 */
export const useUpdateProfile = () => {
    const syncProfile = useSyncProfile()
    return useMutation({
        mutationFn: updateProfileAction,
        onSuccess: (updated) => {
            syncProfile(updated)
            toast.success('Perfil actualizado')
        },
    })
}

export const useUploadProfilePicture = () => {
    const syncProfile = useSyncProfile()
    return useMutation({
        mutationFn: uploadProfilePictureAction,
        onSuccess: (updated) => {
            syncProfile(updated)
            toast.success('Foto actualizada')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir la foto')),
    })
}

export const useUploadDocument = () => {
    return useMutation({
        mutationFn: ({ type, file }: { type: DocumentType; file: File }) =>
            uploadDocumentAction(type, file),
        onSuccess: () => toast.success('Documento subido correctamente'),
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir el documento')),
    })
}

/**
 * El endpoint tiene rate limit (5 por minuto) y devuelve 409 con mensaje propio
 * —"Ese ya es tu correo actual" / "Ese correo ya está en uso"—, que se muestra
 * tal cual. Sin `retry` a propósito: reintentar solo gasta cupo y termina en un
 * 429. Las mutations de TanStack Query no reintentan por defecto, así que
 * alcanza con no pedirlo.
 */
export const useRequestEmailChange = () => {
    return useMutation({
        mutationFn: (newEmail: string) => requestEmailChangeAction(newEmail),
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos pedir el cambio')),
    })
}
