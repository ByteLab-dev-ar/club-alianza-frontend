import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type {
    BellNotice,
    NotificationPreferences,
    Undeliverable,
    UnreadCount,
} from '../interfaces/Notification'

/**
 * GET /notifications — los avisos, del más nuevo al más viejo.
 *
 * El backend corta en 50 y no hay paginación: no es una carencia, es que nadie
 * baja cincuenta avisos buscando el 51.
 *
 * Acepta `?unread=true`, pero acá se piden TODOS a propósito. Con solo los no
 * leídos, marcar uno lo hace desaparecer de la lista debajo del dedo, y quien
 * abrió la campana para releer algo que ya vio no lo encuentra. La lista
 * muestra los dos y se distinguen visualmente.
 */
export const getNotificationsAction = async () => {
    const response = await clubApi.get<ApiResponse<BellNotice[]>>('/notifications')
    return unwrap(response)
}

/**
 * GET /notifications/unread-count — el número del badge, y nada más.
 *
 * Va aparte del listado porque se pide en cada pantalla y cada tanto: no puede
 * arrastrar cincuenta filas para mostrar un número.
 */
export const getUnreadCountAction = async () => {
    const response = await clubApi.get<ApiResponse<UnreadCount>>('/notifications/unread-count')
    return unwrap(response)
}

/**
 * PATCH /notifications/:deliveryId/read — marca UNA entrega.
 *
 * El id es de la entrega y no del aviso: el mismo hecho le llegó a los dos
 * tutores por separado, y que uno lo lea no se lo apaga al otro.
 *
 * No existe "marcar como no leído", y es deliberado.
 */
export const markNotificationReadAction = async (deliveryId: string) => {
    await clubApi.patch<ApiResponse<null>>(`/notifications/${deliveryId}/read`)
}

/** PATCH /notifications/read-all — marca todos. Devuelve cuántos marcó. */
export const markAllNotificationsReadAction = async () => {
    const response = await clubApi.patch<ApiResponse<{ marked: number }>>(
        '/notifications/read-all',
    )
    return unwrap(response)
}

/** GET /notifications/preferences — hoy es un solo booleano. */
export const getNotificationPreferencesAction = async () => {
    const response = await clubApi.get<ApiResponse<NotificationPreferences>>(
        '/notifications/preferences',
    )
    return unwrap(response)
}

/** PATCH /notifications/preferences — devuelve las preferencias ya aplicadas. */
export const updateNotificationPreferencesAction = async (coverageEmails: boolean) => {
    const response = await clubApi.patch<ApiResponse<NotificationPreferences>>(
        '/notifications/preferences',
        { coverageEmails },
    )
    return unwrap(response)
}

/**
 * GET /admin/notifications/undeliverable — con quién no se puede comunicar el
 * club. **Solo ADMIN.**
 *
 * No hay endpoint para "los avisos que sí salieron", y es a propósito: una
 * lista de miles de entregas correctas esconde las pocas que importan.
 */
export const getUndeliverableAction = async () => {
    const response = await clubApi.get<ApiResponse<Undeliverable>>(
        '/admin/notifications/undeliverable',
    )
    return unwrap(response)
}
