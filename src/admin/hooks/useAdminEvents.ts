import { useMutation, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    createEventAction,
    createEventCategoryAction,
    deleteEventAction,
    deleteEventCategoryAction,
    updateEventAction,
    type EventFormData,
} from '../actions/events.actions'

/**
 * Invalida los listados públicos de eventos y categorías tras un cambio.
 *
 * El Resumen ya no, y no es un olvido: lo invalidaba por "Eventos próximos",
 * que salió de la fila el 18/09/2026 (ver `DashboardPage`). Ningún otro número
 * de esa pantalla depende de los eventos, y la raíz del Resumen arrastra los
 * cinco desgloses de `/admin/stats/*`: invalidarla acá los volvía a pedir todos
 * por nada.
 */
const useInvalidateEvents = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.events] })
        void queryClient.invalidateQueries({ queryKey: [QK.eventCategories] })
    }
}

export const useCreateEvent = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: createEventAction, onSuccess: invalidate })
}

export const useUpdateEvent = (id: string) => {
    const invalidate = useInvalidateEvents()
    return useMutation({
        mutationFn: (payload: EventFormData) => updateEventAction(id, payload),
        onSuccess: invalidate,
    })
}

/**
 * Los borrados se disparan desde ConfirmDialog, que no tiene form ni contexto
 * para armar el mensaje: por eso el feedback vive acá. Las altas y ediciones lo
 * manejan desde FormDialog, que sí sabe si está creando o editando.
 */
export const useDeleteEvent = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({
        mutationFn: deleteEventAction,
        onSuccess: () => {
            invalidate()
            notify.success('Evento eliminado')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos eliminar el evento')),
    })
}

export const useCreateEventCategory = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: createEventCategoryAction, onSuccess: invalidate })
}

export const useDeleteEventCategory = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: deleteEventCategoryAction, onSuccess: invalidate })
}
