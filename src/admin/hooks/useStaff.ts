import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import type { Role } from '@/constants/roles'
import { notify } from '@/lib/notify'
import {
    createStaffAction,
    getUsersAction,
    inviteStaffAction,
    reinstateStaffAction,
    removeFromStaffAction,
    resendStaffInviteAction,
    updateUserRolesAction,
} from '../actions/staff.actions'
import type { CreateStaffPayload, InviteStaffPayload, StaffQuery } from '../interfaces/StaffUser'

const STAFF_KEY = QK.adminStaff

/**
 * Listado de cuentas del panel.
 *
 * Antes esto pedía cada rol por separado y fusionaba las cuatro respuestas
 * deduplicando por id: era un rodeo para un endpoint que solo sabía filtrar por
 * un rol a la vez, y que además devolvía todas las cuentas del sistema. Ahora
 * `GET /admin/users` ya devuelve solo personal, así que alcanza con una query —
 * y de paso la paginación pasa a ser la real del servidor en vez de un `limit:
 * 100` por rol que descartaba silenciosamente al staff número 101.
 */
export const useStaff = (query: StaffQuery, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: [STAFF_KEY, query],
        queryFn: () => getUsersAction(query),
        // Para el buscador de cuentas existentes, que consulta con
        // includeMembers y traería el padrón entero si no hay nada que filtrar.
        enabled: options?.enabled ?? true,
        // Sin esto la tabla parpadea a vacío en cada cambio de página o filtro.
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
    })
}

const useInvalidateStaff = () => {
    const queryClient = useQueryClient()
    return () => queryClient.invalidateQueries({ queryKey: [STAFF_KEY] })
}

/**
 * Ninguna mutación de esta pantalla hace update optimista.
 *
 * Casi todas tienen guardas del lado del servidor que pueden rechazarlas
 * (quitarse a uno mismo, una cuenta ya dada de baja, el mail que no sale), así
 * que adelantar el resultado obligaría a revertirlo seguido. Se invalida y se
 * relee. Los mensajes de error vienen ya redactados en español desde el
 * backend: el fallback solo cubre caídas de red.
 */
export const useCreateStaff = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: (payload: CreateStaffPayload) => createStaffAction(payload),
        onSuccess: invalidate,
    })
}

export const useInviteStaff = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: (payload: InviteStaffPayload) => inviteStaffAction(payload),
        onSuccess: invalidate,
    })
}

export const useUpdateUserRoles = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
            updateUserRolesAction(id, roles),
        onSuccess: () => {
            void invalidate()
            notify.success('Roles actualizados')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos actualizar los roles')),
    })
}

/**
 * Quitar del personal. La fila desaparece del listado al invalidar, porque deja
 * de tener rol de staff — no queda como "Dado de baja" en su lugar.
 */
export const useRemoveFromStaff = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: (id: string) => removeFromStaffAction(id),
        onSuccess: (user) => {
            void invalidate()
            // El backend decide el efecto según isMember; el toast lo refleja
            // para que quede claro qué pasó con la cuenta.
            notify.success(
                user.isMember
                    ? 'Quitado del personal. Sigue siendo socio del club.'
                    : 'Quitado del personal. Su cuenta quedó dada de baja.',
            )
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos quitarlo del personal')),
    })
}

export const useReinstateStaff = () => {
    const invalidate = useInvalidateStaff()
    return useMutation({
        mutationFn: ({ id, roles }: { id: string; roles: Role[] }) =>
            reinstateStaffAction(id, roles),
        onSuccess: () => {
            void invalidate()
            notify.success('Usuario reincorporado')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos reincorporar al usuario')),
    })
}

/**
 * Reenvío de la invitación. No invalida la lista: no cambia ningún dato visible
 * (la cuenta sigue igual de "Pendiente" hasta que la persona abra el link).
 */
export const useResendStaffInvite = () => {
    return useMutation({
        mutationFn: (id: string) => resendStaffInviteAction(id),
        onSuccess: ({ email }) => notify.success(`Invitación reenviada a ${email}`),
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos reenviar la invitación')),
    })
}
