import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    getNotificationPreferencesAction,
    getNotificationsAction,
    getUnreadCountAction,
    markAllNotificationsReadAction,
    markNotificationReadAction,
    updateNotificationPreferencesAction,
} from '../actions/notifications.actions'

/**
 * Cada cuánto se vuelve a preguntar el número del badge.
 *
 * No hay push ni WebSocket, y es una decisión escrita del proyecto: para un club
 * donde el aviso más urgente tolera una hora, un endpoint HTTP alcanza. Un
 * minuto es de sobra para eso y le pega a un endpoint que devuelve un número.
 */
const BADGE_POLL_MS = 60_000

/**
 * El número del badge.
 *
 * `refetchIntervalInBackground: true` no es opcional: sin eso TanStack Query
 * pausa el intervalo cuando la pestaña pierde foco, y el contador se congela
 * justo en el caso más común —la pestaña del club abierta atrás mientras la
 * persona hace otra cosa—. Es el mismo problema que tuvo la barra de progreso
 * del alta masiva.
 */
export const useUnreadCount = () => {
    return useQuery({
        queryKey: [QK.notificationsUnread],
        queryFn: getUnreadCountAction,
        refetchInterval: BADGE_POLL_MS,
        refetchIntervalInBackground: true,
        staleTime: BADGE_POLL_MS,
    })
}

/**
 * Los avisos, para el panel desplegable.
 *
 * `enabled` para no bajar cincuenta filas hasta que alguien abra la campana: el
 * badge ya se resuelve con su propio endpoint, que devuelve un número.
 */
export const useNotifications = (enabled: boolean) => {
    return useQuery({
        queryKey: [QK.notifications],
        queryFn: getNotificationsAction,
        enabled,
        // Al abrir se pide de nuevo: el badge pudo haber cambiado hace un minuto
        // y la lista tiene que coincidir con el número que se acaba de ver.
        staleTime: 0,
        refetchOnMount: 'always',
    })
}

/**
 * Invalida lo que cambia al leer: la lista y el badge.
 *
 * Los dos, siempre. Marcar uno cambia el número, y "marcar todos" cambia las dos
 * cosas; dejar una sin invalidar deja la campana diciendo un número que su
 * propia lista desmiente.
 */
const useInvalidateBell = () => {
    const queryClient = useQueryClient()

    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.notifications] })
        void queryClient.invalidateQueries({ queryKey: [QK.notificationsUnread] })
    }
}

/**
 * Marca UNA entrega como leída.
 *
 * Sin toast: se dispara al tocar un aviso, y avisar de algo que la persona
 * acaba de hacer a propósito es ruido. Si falla tampoco se avisa —el aviso
 * simplemente sigue sin leer, que es un estado válido y visible—.
 */
export const useMarkNotificationRead = () => {
    const invalidate = useInvalidateBell()

    return useMutation({
        mutationFn: markNotificationReadAction,
        onSuccess: invalidate,
    })
}

export const useMarkAllNotificationsRead = () => {
    const invalidate = useInvalidateBell()

    return useMutation({
        mutationFn: markAllNotificationsReadAction,
        onSuccess: invalidate,
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos marcar los avisos como leídos')),
    })
}

/**
 * Si quiere el correo de coberturas por vencer.
 *
 * Es la ÚNICA preferencia que existe y apaga un correo, no la campana. Arranca
 * encendida.
 */
export const useNotificationPreferences = () => {
    return useQuery({
        queryKey: [QK.notificationPreferences],
        queryFn: getNotificationPreferencesAction,
        staleTime: 1000 * 60 * 5,
    })
}

export const useUpdateNotificationPreferences = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateNotificationPreferencesAction,
        // El servidor devuelve las preferencias ya aplicadas: se escriben en el
        // cache en vez de invalidar, así el switch no parpadea a la posición
        // vieja mientras vuelve el refetch.
        onSuccess: (preferences) => {
            queryClient.setQueryData([QK.notificationPreferences], preferences)
            notify.success(
                preferences.coverageEmails
                    ? 'Te vamos a avisar por correo antes de que venza'
                    : 'No te vamos a mandar más ese correo',
            )
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos guardar la preferencia')),
    })
}
