import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    createEventAction,
    createEventCategoryAction,
    deleteEventAction,
    deleteEventCategoryAction,
    updateEventAction,
    type EventFormData,
} from '../actions/events.actions'

/** Invalida los listados públicos de eventos y categorías tras un cambio. */
const useInvalidateEvents = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.events] })
        void queryClient.invalidateQueries({ queryKey: [QK.eventCategories] })
        void queryClient.invalidateQueries({ queryKey: [QK.adminDashboard] })
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
            toast.success('Evento eliminado')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos eliminar el evento')),
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
