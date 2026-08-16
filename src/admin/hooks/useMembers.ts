import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    attachAccountAction,
    clearDelinquencyAction,
    createMemberAction,
    deleteMemberAction,
    getGuardiansAction,
    getMemberAction,
    getMembersAction,
    removeGuardianAction,
    resendWelcomeAction,
    revokeCredentialAction,
    setPlayerMarkAction,
    updateMemberAction,
} from '../actions/members.actions'
import type { AdminMembersQuery, UpdateMemberPayload } from '../interfaces/AdminMember'

const MEMBERS_KEY = QK.adminMembers

export const useMembers = (query: AdminMembersQuery) => {
    return useQuery({
        queryKey: [MEMBERS_KEY, query],
        queryFn: () => getMembersAction(query),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
    })
}

export const useMember = (id: string | undefined) => {
    return useQuery({
        queryKey: [MEMBERS_KEY, 'detail', id],
        queryFn: () => getMemberAction(id!),
        enabled: !!id,
    })
}

/** Invalida los listados de socios y el dashboard tras una alta/edición/baja. */
const useInvalidateMembers = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] })
        // Altas y bajas mueven los contadores del dashboard (total, activos).
        void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
    }
}

export const useCreateMember = () => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: createMemberAction,
        onSuccess: invalidate,
    })
}

export const useUpdateMember = (id: string) => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: (payload: UpdateMemberPayload) => updateMemberAction(id, payload),
        onSuccess: invalidate,
    })
}

/**
 * Anula la credencial del socio sin darlo de baja. El toast usa el `message`
 * del backend, que explica que la tarjeta anterior dejó de servir y cómo sigue.
 */
export const useRevokeCredential = () => {
    return useMutation({
        mutationFn: revokeCredentialAction,
        onSuccess: ({ message }) => toast.success(message),
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos anular la credencial')),
    })
}

/**
 * Reenvía el acceso a un socio puntual.
 *
 * No invalida nada: el socio no cambia de estado por recibir el mail —sigue sin
 * verificar hasta que abra el link—, así que refrescar la lista solo mostraría
 * exactamente lo mismo.
 *
 * El 503 es transitorio (el servicio de mail no respondió) y su mensaje ya
 * invita a reintentar, así que se muestra tal cual.
 */
export const useResendWelcome = () => {
    return useMutation({
        mutationFn: resendWelcomeAction,
        onSuccess: ({ email }) => toast.success(`Correo de bienvenida reenviado a ${email}`),
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos reenviar el correo')),
    })
}

/**
 * Marcar o desmarcar jugador.
 *
 * Toma el estado destino, no un toggle: con "cambialo", dos clicks sobre una
 * pantalla desactualizada dejan al socio en el estado contrario al que el admin
 * veía. El toast dice explícitamente que no toca la cobertura, porque es la
 * confusión que §5.7 existe para evitar.
 */
export const useSetPlayerMark = () => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: ({ id, isPlayer }: { id: string; isPlayer: boolean }) =>
            setPlayerMarkAction(id, isPlayer),
        onSuccess: (member) => {
            invalidate()
            toast.success(
                member.isPlayer
                    ? 'Marcado como jugador. Desde ahora se le cobra la actividad.'
                    : 'Ya no está marcado como jugador. Lo que ya pagó le sigue corriendo.',
            )
        },
        // El 409 es "todavía no es socio": todo jugador es socio, así que
        // primero hay que aprobarle la solicitud.
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos cambiar la marca')),
    })
}

/** Engancharle una cuenta a un perfil que ya existe. NO crea un socio nuevo. */
export const useAttachAccount = (id: string) => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: (email: string) => attachAccountAction(id, email),
        onSuccess: () => {
            invalidate()
            toast.success('Cuenta creada. Le mandamos el correo para configurar su contraseña.')
        },
    })
}

/** Quiénes responden por este socio. */
export const useGuardians = (id: string | undefined) => {
    return useQuery({
        queryKey: [MEMBERS_KEY, 'guardians', id],
        queryFn: () => getGuardiansAction(id!),
        enabled: !!id,
    })
}

export const useRemoveGuardian = (id: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (guardianProfileId: string) => removeGuardianAction(id, guardianProfileId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY, 'guardians', id] })
            toast.success('Tutor desvinculado')
        },
        // El 409 es la guarda del último tutor, y su mensaje lo explica: hay que
        // asignarle otro antes de sacarlo.
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos sacar al tutor')),
    })
}

/**
 * Destrabar a un moroso.
 *
 * El toast repite lo que el endpoint aclara y conviene no olvidar: **no le
 * extiende la cobertura**. Es un indulto, no una amnistía — si sigue debiendo,
 * la corrida nocturna lo vuelve a marcar.
 */
export const useClearDelinquency = (id: string) => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: (reason: string) => clearDelinquencyAction(id, reason),
        onSuccess: () => {
            invalidate()
            toast.success('Destrabado. Ojo: esto no le extiende la cobertura.')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos destrabarlo')),
    })
}

/** Ver la nota de useDeleteEvent: el feedback del borrado vive en el hook. */
export const useDeleteMember = () => {
    const invalidate = useInvalidateMembers()
    return useMutation({
        mutationFn: deleteMemberAction,
        onSuccess: () => {
            invalidate()
            toast.success('Socio eliminado')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos eliminar al socio')),
    })
}
