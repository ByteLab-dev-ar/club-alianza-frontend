import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { ClubEvent, EventCategory } from '@/events/interfaces/ClubEvent'

export interface EventFormData {
    title: string
    description?: string
    date: string
    time: string
    location: string
    categoryId?: string
    /** Imagen opcional (multipart). Solo se manda en el alta. */
    file?: File | null
}

const toEventFormData = (payload: EventFormData): FormData => {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('date', payload.date)
    formData.append('time', payload.time)
    formData.append('location', payload.location)
    if (payload.description) formData.append('description', payload.description)
    if (payload.categoryId) formData.append('categoryId', payload.categoryId)
    if (payload.file) formData.append('file', payload.file)
    return formData
}

/** POST /admin/events — multipart con imagen opcional. */
export const createEventAction = async (payload: EventFormData) => {
    const response = await clubApi.post<ApiResponse<ClubEvent>>(
        '/admin/events',
        toEventFormData(payload),
    )
    return unwrap(response)
}

/** PATCH /admin/events/:id — actualiza datos (sin reemplazar la imagen). */
export const updateEventAction = async (id: string, payload: Omit<EventFormData, 'file'>) => {
    const response = await clubApi.patch<ApiResponse<ClubEvent>>(`/admin/events/${id}`, {
        title: payload.title,
        description: payload.description,
        date: payload.date,
        time: payload.time,
        location: payload.location,
        categoryId: payload.categoryId || null,
    })
    return unwrap(response)
}

/** DELETE /admin/events/:id — borra el evento y su imagen en R2. */
export const deleteEventAction = async (id: string) => {
    await clubApi.delete(`/admin/events/${id}`)
}

// --- Categorías de eventos ---

export const createEventCategoryAction = async (payload: { name: string; color: string }) => {
    const response = await clubApi.post<ApiResponse<EventCategory>>(
        '/admin/events/categories',
        payload,
    )
    return unwrap(response)
}

export const deleteEventCategoryAction = async (id: string) => {
    await clubApi.delete(`/admin/events/categories/${id}`)
}
