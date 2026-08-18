import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import type { UpdateProfilePayload } from '../actions/profile.actions'
import {
    attachWardAccountAction,
    cancelWardApplicationAction,
    createWardAction,
    getWardAction,
    getWardCredentialAction,
    getWardDocumentsAction,
    getWardsAction,
    submitWardApplicationAction,
    unmarkWardAsPlayerAction,
    updateWardAction,
    uploadWardDocumentAction,
    uploadWardPhotoAction,
} from '../actions/wards.actions'
import type { UploadableDocumentType } from '../interfaces/MemberProfile'

export const useWards = () => {
    return useQuery({
        queryKey: [QK.memberWards],
        queryFn: getWardsAction,
        staleTime: 1000 * 60 * 2,
    })
}

/**
 * La ficha de UN tutelado, con `missingRequirements` y `canSubmitApplication`.
 *
 * No sale del listado: `GET /members/wards` devuelve la ficha sin el trámite, y
 * armar la pantalla del chico con esa versión dejaba al tutor cargando datos a
 * ciegas hasta el 422 de presentar.
 *
 * Sin reintentos porque las dos respuestas de error son definitivas y dicen
 * cosas distintas: **404** = no es un tutelado tuyo, **409** = ya cumplió 18 y
 * se gestiona solo. Reintentar cualquiera de las dos solo demora el cartel.
 */
export const useWard = (profileId: string | undefined) => {
    return useQuery({
        queryKey: [QK.wardProfile, profileId],
        queryFn: () => getWardAction(profileId!),
        enabled: !!profileId,
        retry: false,
    })
}

export const useWardDocuments = (profileId: string | undefined) => {
    return useQuery({
        queryKey: [QK.wardDocuments, profileId],
        queryFn: () => getWardDocumentsAction(profileId!),
        enabled: !!profileId,
    })
}

/**
 * La credencial del tutelado. Sin cache, igual que la propia: el backend firma
 * un token nuevo en cada llamada, y la captura que el tutor le manda al chico
 * tiene que ser la más fresca posible.
 *
 * `enabled` lo decide quien llama mirando `membershipStatus`: el endpoint
 * responde 403 mientras el chico no sea socio aprobado, y pedirla igual sería
 * fabricar un error para no mostrar nada.
 */
export const useWardCredential = (profileId: string | undefined, enabled: boolean) => {
    return useQuery({
        queryKey: [QK.wardCredential, profileId],
        queryFn: () => getWardCredentialAction(profileId!),
        enabled: !!profileId && enabled,
        staleTime: 0,
        refetchOnMount: 'always',
    })
}

/**
 * Todo lo que toca a un tutelado mueve su ficha y sus documentos, y también el
 * listado —que trae la ficha entera de cada chico—.
 *
 * `wardProfile` va con los demás y no aparte: es la ficha con el trámite, o sea
 * lo que decide si el botón de presentar está habilitado. Sin invalidarla, el
 * tutor sube el DNI que faltaba y el checklist se lo sigue pidiendo.
 */
const useSyncWards = () => {
    const queryClient = useQueryClient()
    return (profileId?: string) => {
        void queryClient.invalidateQueries({ queryKey: [QK.memberWards] })
        if (profileId) {
            void queryClient.invalidateQueries({ queryKey: [QK.wardProfile, profileId] })
            void queryClient.invalidateQueries({ queryKey: [QK.wardDocuments, profileId] })
            void queryClient.invalidateQueries({ queryKey: [QK.wardCredential, profileId] })
        }
    }
}

/**
 * El 422 nombra qué le falta AL TUTOR, no al chico, y por eso se muestra
 * completo: "te falta cargar tu CUIL y las dos fotos de tu DNI" es accionable;
 * "no pudimos cargar al menor" manda a nadie a ningún lado.
 */
export const useCreateWard = () => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: createWardAction,
        onSuccess: (ward) => {
            syncWards()
            toast.success(`${ward.name} quedó cargado. Ahora subí su documentación.`)
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos cargar al menor')),
    })
}

export const useUpdateWard = (profileId: string) => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) => updateWardAction(profileId, payload),
        onSuccess: () => {
            syncWards(profileId)
            toast.success('Datos actualizados')
        },
    })
}

export const useUploadWardDocument = (profileId: string) => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: ({ type, file }: { type: UploadableDocumentType; file: File }) =>
            uploadWardDocumentAction(profileId, type, file),
        onSuccess: () => {
            syncWards(profileId)
            toast.success('Documento subido correctamente')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir el documento')),
    })
}

export const useUploadWardPhoto = (profileId: string) => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: (file: File) => uploadWardPhotoAction(profileId, file),
        onSuccess: () => {
            syncWards(profileId)
            toast.success('Foto actualizada')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir la foto')),
    })
}

export const useSubmitWardApplication = (profileId: string) => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: () => submitWardApplicationAction(profileId),
        onSuccess: () => {
            syncWards(profileId)
            toast.success('Solicitud presentada. El club la va a revisar.')
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos presentar la solicitud')),
    })
}

export const useCancelWardApplication = (profileId: string) => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: () => cancelWardApplicationAction(profileId),
        onSuccess: () => {
            syncWards(profileId)
            toast.success('Solicitud cancelada. Ya podés corregir sus datos.')
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos cancelar la solicitud')),
    })
}

/**
 * Sacar al chico de la actividad. Solo desmarcar — volver a marcarlo lo decide
 * el club, y el endpoint responde 403 si se intenta desde acá.
 *
 * También se invalida el carrito: la actividad deja de ofrecerse para ese chico
 * a partir del mes que viene, y una pantalla abierta seguiría mostrándola.
 */
export const useUnmarkWardAsPlayer = (profileId: string) => {
    const syncWards = useSyncWards()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => unmarkWardAsPlayerAction(profileId),
        onSuccess: () => {
            syncWards(profileId)
            void queryClient.invalidateQueries({ queryKey: [QK.paymentsCart] })
            toast.success('Listo. Ya no se le va a cobrar la actividad.')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos hacer el cambio')),
    })
}

/**
 * Engancharle una cuenta al chico.
 *
 * El **409 de los 18** no es un error genérico y no hay que mostrarlo como tal:
 * significa que la persona ya es adulta y la cuenta se la engancha el club. El
 * mensaje del backend ya lo dice, así que se muestra tal cual — traducirlo a
 * "algo salió mal" dejaría al tutor sin saber que la salida es pedírselo al
 * club.
 */
export const useAttachWardAccount = (profileId: string) => {
    const syncWards = useSyncWards()
    return useMutation({
        mutationFn: (email: string) => attachWardAccountAction(profileId, email),
        onSuccess: () => {
            syncWards(profileId)
            toast.success('Le mandamos el correo para que configure su contraseña.')
        },
    })
}
