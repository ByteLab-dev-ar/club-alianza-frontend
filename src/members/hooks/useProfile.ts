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
import type { UploadableDocumentType } from '../interfaces/MemberProfile'

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
 * Refresca el perfil y la credencial después de tocar la ficha.
 *
 * Acá antes se escribía la respuesta directo en el cache con `setQueryData`, y
 * con el trámite de §1 eso pasó a estar mal: el PATCH y la subida de foto
 * devuelven `MemberResponseDto`, que **no trae `missingRequirements` ni
 * `canSubmitApplication`** —los calcula solo el GET—. Escribir esa respuesta
 * encima borraría el checklist justo cuando la persona lo está completando, y
 * subir la foto es literalmente uno de los ítems que lo achica.
 *
 * La credencial se invalida porque muestra nombre, apellido, DNI y foto, y con
 * su staleTime de 5 minutos quedaría vieja.
 */
const useSyncProfile = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.memberProfile] })
        void queryClient.invalidateQueries({ queryKey: [QK.memberCredential] })
    }
}

/**
 * Sin `onError` a propósito: quien lo usa engancha el 409 al campo que lo causó
 * —CUIL o DNI— (ver ProfileForm), que es más útil que un toast genérico.
 */
export const useUpdateProfile = () => {
    const syncProfile = useSyncProfile()
    return useMutation({
        mutationFn: updateProfileAction,
        onSuccess: () => {
            syncProfile()
            toast.success('Perfil actualizado')
        },
    })
}

export const useUploadProfilePicture = () => {
    const syncProfile = useSyncProfile()
    return useMutation({
        mutationFn: uploadProfilePictureAction,
        onSuccess: () => {
            syncProfile()
            toast.success('Foto actualizada')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir la foto')),
    })
}

/**
 * Solo los dos lados del DNI: la ficha firmada de §1.4 entra por sus propios
 * endpoints.
 *
 * Invalida **las dos** listas, y la segunda no es opcional: el perfil, porque el
 * documento recién subido es uno de los ítems de `missingRequirements`; y
 * `memberDocuments`, que es de donde la pantalla saca el "Subido el 14/08".
 *
 * Sin esa segunda, la tarjeta se quedaba diciendo "Todavía no lo subiste"
 * después de una subida exitosa —su query tiene cinco minutos de `staleTime`—,
 * así que el único indicio de que el archivo había entrado era el toast. Un
 * toast se va solo en cuatro segundos: no es una respuesta a "¿se subió o no?".
 */
export const useUploadDocument = () => {
    const syncProfile = useSyncProfile()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ type, file }: { type: UploadableDocumentType; file: File }) =>
            uploadDocumentAction(type, file),
        onSuccess: () => {
            syncProfile()
            void queryClient.invalidateQueries({ queryKey: [QK.memberDocuments] })
            toast.success('Documento subido correctamente')
        },
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
