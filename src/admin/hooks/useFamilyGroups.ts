import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    addFamilyGroupMemberAction,
    createFamilyGroupAction,
    deleteFamilyGroupAction,
    getFamilyGroupSuggestionsAction,
    getFamilyGroupsAction,
    removeFamilyGroupMemberAction,
    renameFamilyGroupAction,
} from '../actions/family-groups.actions'

export const useFamilyGroups = () => {
    return useQuery({
        queryKey: [QK.adminFamilyGroups],
        queryFn: getFamilyGroupsAction,
        staleTime: 1000 * 60,
    })
}

export const useFamilyGroupSuggestions = () => {
    return useQuery({
        queryKey: [QK.adminFamilyGroupSuggestions],
        queryFn: getFamilyGroupSuggestionsAction,
        staleTime: 1000 * 60,
    })
}

/**
 * Confirmar un grupo saca a esa familia de las sugerencias, así que las dos
 * listas se mueven juntas: sin esto, la sugerencia recién aceptada seguiría
 * ofreciéndose y un segundo click crearía el grupo dos veces.
 */
const useInvalidateFamilyGroups = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.adminFamilyGroups] })
        void queryClient.invalidateQueries({ queryKey: [QK.adminFamilyGroupSuggestions] })
    }
}

export const useCreateFamilyGroup = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: createFamilyGroupAction,
        onSuccess: invalidate,
    })
}

export const useRenameFamilyGroup = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            renameFamilyGroupAction(id, name),
        onSuccess: invalidate,
    })
}

export const useDeleteFamilyGroup = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: deleteFamilyGroupAction,
        onSuccess: () => {
            invalidate()
            notify.success('Grupo eliminado')
        },
        // El 409 explica que primero hay que sacar a los socios: las
        // pertenencias son el registro de con qué descuento se les cobró.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos borrar el grupo')),
    })
}

export const useAddFamilyGroupMember = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: ({ id, profileId }: { id: string; profileId: string }) =>
            addFamilyGroupMemberAction(id, profileId),
        onSuccess: () => {
            invalidate()
            notify.success('Listo. Cuenta para el descuento desde el mes que viene.')
        },
        // El 409 distingue tres cosas: ya está en este grupo, ya pertenece a
        // otro (nadie puede estar en dos familias a la vez), o todavía no es
        // socio del club.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos agregarlo')),
    })
}

export const useRemoveFamilyGroupMember = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: ({ id, profileId }: { id: string; profileId: string }) =>
            removeFamilyGroupMemberAction(id, profileId),
        onSuccess: () => {
            invalidate()
            notify.success('Listo. Este mes todavía cuenta; deja de contar el que viene.')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos sacarlo')),
    })
}
