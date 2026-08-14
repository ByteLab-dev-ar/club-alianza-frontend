import { clubApi, unwrap, unwrapPaginated } from '@/api/clubApi'
import type { ApiResponse, PaginatedResponse } from '@/api/types'
import type {
    GalleryAlbum,
    GalleryAlbumListItem,
    GalleryCategory,
    GalleryQuery,
} from '../interfaces/Gallery'

/**
 * GET /gallery — público, paginado.
 *
 * El orden viene resuelto del backend: por fecha del momento, del más nuevo al
 * más viejo, y los que no tienen fecha al final. No reordenar acá: hacerlo
 * dentro de una página rompe el orden global entre páginas.
 */
export const getGalleryAction = async (query: GalleryQuery = {}) => {
    const response = await clubApi.get<PaginatedResponse<GalleryAlbumListItem>>('/gallery', {
        params: query,
    })
    return unwrapPaginated(response)
}

/**
 * GET /gallery/:id — el momento con todas sus fotos.
 *
 * Dos fallas distintas y conviene tratarlas distinto: un id que no existe da
 * 404 ("Momento no encontrado") y algo que no es UUID da 400 ("Validation
 * failed"). El 400 es una URL rota; el 404, algo que ya no está.
 */
export const getGalleryAlbumAction = async (id: string) => {
    const response = await clubApi.get<ApiResponse<GalleryAlbum>>(`/gallery/${id}`)
    return unwrap(response)
}

/** GET /gallery/categories — público, array plano y sin `meta`. */
export const getGalleryCategoriesAction = async () => {
    const response = await clubApi.get<ApiResponse<GalleryCategory[]>>('/gallery/categories')
    return unwrap(response)
}
