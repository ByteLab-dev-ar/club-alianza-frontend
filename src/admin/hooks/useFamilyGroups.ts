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
    type FamilyGroupSuggestion,
} from '../actions/family-groups.actions'
import { addMembersInOrder, suggestionNotice } from '../lib/family-groups'

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
 *
 * Devuelve la promesa del refetch para quien necesite esperarlo (confirmar una
 * sugerencia); los demás la ignoran. No rechaza aunque el refetch falle.
 */
const useInvalidateFamilyGroups = () => {
    const queryClient = useQueryClient()
    return () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: [QK.adminFamilyGroups] }),
            queryClient.invalidateQueries({ queryKey: [QK.adminFamilyGroupSuggestions] }),
        ])
}

export const useCreateFamilyGroup = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: createFamilyGroupAction,
        onSuccess: () => {
            invalidate()
            notify.success('Grupo creado')
        },
        // Sin esto un 400 del nombre no decía nada: el botón dejaba de girar,
        // el campo seguía lleno y no aparecía ningún grupo.
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos crear el grupo')),
    })
}

/**
 * Confirmar una sugerencia: crear el grupo y sumarle a los integrantes
 * propuestos, **como una sola operación con un solo aviso**.
 *
 * Es una mutación propia y no `useCreateFamilyGroup` + `useAddFamilyGroupMember`
 * encadenados desde la tarjeta, que es como estaba, por tres cosas que se
 * rompían:
 *
 * - **Un aviso por integrante.** El de sumar socio avisa en cada llamada —en el
 *   diálogo de a uno es lo correcto—, así que una familia de tres tiraba tres
 *   "Listo…" apilados.
 * - **El grupo a medio armar sin que nadie lo dijera.** Un rechazo a mitad de
 *   camino cortaba todo con un error que nadie atrapaba: el grupo quedaba
 *   creado con parte de la familia, y la pantalla no decía ni eso.
 * - **El doble grupo.** Después de ese corte la tarjeta volvía a habilitar
 *   "Confirmar grupo" sobre una familia que ya tenía grupo, sin ningún aviso, y
 *   un segundo click creaba otro con el mismo nombre. Acá `isPending` cubre la
 *   operación entera **hasta que llegan las sugerencias nuevas**, se invalida
 *   una sola vez al final pase lo que pase —la sugerencia se va o se achica— y
 *   si quedó incompleto el aviso lo dice.
 *
 * Si falla crear el grupo no se creó nada y es un error. Si falla sumar a
 * alguien el grupo YA existe, así que no es un error sino un aviso que dice
 * quién quedó adentro y quién no (ver `suggestionNotice`).
 */
export const useConfirmFamilyGroupSuggestion = () => {
    const invalidate = useInvalidateFamilyGroups()
    return useMutation({
        mutationFn: async (suggestion: FamilyGroupSuggestion) => {
            const group = await createFamilyGroupAction(suggestion.suggestedName)
            const result = await addMembersInOrder(
                suggestion.members,
                (member) => addFamilyGroupMemberAction(group.id, member.id),
                (error) => getApiErrorMessage(error, 'No se pudo sumar'),
            )
            return { groupName: group.name, ...result }
        },
        onSuccess: (result) => {
            const notice = suggestionNotice(result)
            if (notice.tone === 'warning') {
                // Sin auto-cierre, como el pago aprobado que no otorgó nada: el
                // grupo quedó incompleto y la única otra pista es una tarjeta con
                // menos gente, que nadie compara contra la sugerencia que ya no
                // está.
                notify.warning(notice.title, { description: notice.description, duration: Infinity })
                return
            }
            notify.success(notice.title, { description: notice.description })
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos crear el grupo')),
        // En `onSettled` y no en `onSuccess`: con el grupo creado y algún
        // integrante rechazado, la sugerencia tiene que irse o actualizarse
        // igual.
        //
        // Y devolviendo la promesa, no disparándola: TanStack espera al
        // `onSettled` del hook antes de dar la mutación por terminada.
        // Disparada sin esperar, `isPending` se apagaba con la tarjeta todavía
        // en pantalla y "Confirmar grupo" volvía a habilitarse sobre un grupo
        // ya creado hasta que llegaba el refetch: un click en esa ventana
        // creaba el grupo dos veces.
        onSettled: () => invalidate(),
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
        // El 409 explica que primero hay que sacar a los socios, así el club ve
        // a quiénes les cambia el descuento. Con la pantalla al día no debería
        // salir (el botón solo aparece sin integrantes): queda para cuando otro
        // admin sumó a alguien mientras tanto.
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
            notify.success('Listo. Cuenta para el descuento desde el próximo pago.')
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
            notify.success('Listo. Deja de contar para el descuento desde el próximo pago.')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos sacarlo')),
    })
}
