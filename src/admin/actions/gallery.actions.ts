import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { GalleryCategory, GalleryImage } from '@/gallery/interfaces/Gallery'

export interface UploadImagePayload {
    title: string
    description?: string
    date?: string
    categoryId?: string
    file: File
}

/** POST /admin/gallery — multipart; la imagen es obligatoria. */
export const uploadImageAction = async (payload: UploadImagePayload) => {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('file', payload.file)
    if (payload.description) formData.append('description', payload.description)
    if (payload.date) formData.append('date', payload.date)
    if (payload.categoryId) formData.append('categoryId', payload.categoryId)

    const response = await clubApi.post<ApiResponse<GalleryImage>>('/admin/gallery', formData)
    return unwrap(response)
}

/** DELETE /admin/gallery/:id — borra el registro y la imagen en R2. */
export const deleteImageAction = async (id: string) => {
    await clubApi.delete(`/admin/gallery/${id}`)
}

// --- Categorías de galería ---

export const createGalleryCategoryAction = async (payload: { name: string; color: string }) => {
    const response = await clubApi.post<ApiResponse<GalleryCategory>>(
        '/admin/gallery/categories',
        payload,
    )
    return unwrap(response)
}

export const deleteGalleryCategoryAction = async (id: string) => {
    await clubApi.delete(`/admin/gallery/categories/${id}`)
}
