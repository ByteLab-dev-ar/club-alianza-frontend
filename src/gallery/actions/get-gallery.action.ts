import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse } from '@/api/types'
import type { GalleryCategory, GalleryImage, GalleryQuery } from '../interfaces/Gallery'

/** GET /gallery — público, paginado, más recientes primero. */
export const getGalleryAction = async (query: GalleryQuery = {}) => {
    const response = await clubApi.get<PaginatedResponse<GalleryImage>>('/gallery', {
        params: query,
    })
    return unwrapPaginated(response)
}

/** GET /gallery/categories — público. */
export const getGalleryCategoriesAction = async () => {
    const response = await clubApi.get<ApiResponse<GalleryCategory[]>>('/gallery/categories')
    return unwrap(response)
}
