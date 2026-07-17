import { useMutation, useQueryClient } from '@tanstack/react-query'

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
        void queryClient.invalidateQueries({ queryKey: ['events'] })
        void queryClient.invalidateQueries({ queryKey: ['event-categories'] })
        void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    }
}

export const useCreateEvent = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: createEventAction, onSuccess: invalidate })
}

export const useUpdateEvent = (id: string) => {
    const invalidate = useInvalidateEvents()
    return useMutation({
        mutationFn: (payload: Omit<EventFormData, 'file'>) => updateEventAction(id, payload),
        onSuccess: invalidate,
    })
}

export const useDeleteEvent = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: deleteEventAction, onSuccess: invalidate })
}

export const useCreateEventCategory = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: createEventCategoryAction, onSuccess: invalidate })
}

export const useDeleteEventCategory = () => {
    const invalidate = useInvalidateEvents()
    return useMutation({ mutationFn: deleteEventCategoryAction, onSuccess: invalidate })
}
