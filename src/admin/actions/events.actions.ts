import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { ClubEvent, EventCategory } from '@/events/interfaces/ClubEvent'

export interface EventFormData {
    title: string
    description?: string
    date: string
    /** Opcionales: el flyer del evento suele traerlos impresos. */
    time?: string
    location?: string
    categoryId?: string
    /** Imagen opcional (multipart). En la edición reemplaza a la actual. */
    file?: File | null
    /** Solo en la edición: borra la imagen actual y deja el evento sin foto. */
    removeImage?: boolean
}

/**
 * El alta OMITE los campos vacíos y la edición los MANDA vacíos. La diferencia
 * no es un descuido:
 *
 * - En el alta no hay nada guardado, así que "sin descripción" y "descripción en
 *   blanco" son lo mismo, y omitirla la deja en null.
 * - En la edición hay que poder distinguir "no la toques" (no mandar el campo)
 *   de "borrala" (mandarla vacía). Y como por acá viaja un archivo, el cuerpo es
 *   multipart, donde no existe el null: el string vacío es lo único que queda
 *   para decir "vaciá esto". El backend lo traduce (ver UpdateClubEventDto).
 */
const toCreateFormData = (payload: EventFormData): FormData => {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('date', payload.date)
    if (payload.time) formData.append('time', payload.time)
    if (payload.location) formData.append('location', payload.location)
    if (payload.description) formData.append('description', payload.description)
    if (payload.categoryId) formData.append('categoryId', payload.categoryId)
    if (payload.file) formData.append('file', payload.file)
    return formData
}

const toUpdateFormData = (payload: EventFormData): FormData => {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('date', payload.date)
    formData.append('time', payload.time ?? '')
    formData.append('location', payload.location ?? '')
    formData.append('description', payload.description ?? '')
    formData.append('categoryId', payload.categoryId ?? '')

    // Los dos juntos son un 400 del backend, a propósito: no hay forma de saber
    // cuál gana. El formulario ya los hace mutuamente excluyentes, así que si
    // llegaran a salir juntos es que se rompió algo y conviene que se note.
    if (payload.file) formData.append('file', payload.file)
    if (payload.removeImage) formData.append('removeImage', 'true')

    return formData
}

/** POST /admin/events — multipart con imagen opcional. */
export const createEventAction = async (payload: EventFormData) => {
    const response = await clubApi.post<ApiResponse<ClubEvent>>(
        '/admin/events',
        toCreateFormData(payload),
    )
    return unwrap(response)
}

/** PATCH /admin/events/:id — multipart: datos, y la imagen si cambió. */
export const updateEventAction = async (id: string, payload: EventFormData) => {
    const response = await clubApi.patch<ApiResponse<ClubEvent>>(
        `/admin/events/${id}`,
        toUpdateFormData(payload),
    )
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
