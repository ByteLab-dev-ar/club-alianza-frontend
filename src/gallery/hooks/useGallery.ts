import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import {
    getGalleryAlbumAction,
    getGalleryAction,
    getGalleryCategoriesAction,
} from '../actions/get-gallery.action'
import type { GalleryQuery } from '../interfaces/Gallery'

export const useGallery = (query: GalleryQuery = {}) => {
    return useQuery({
        queryKey: [QK.gallery, query],
        queryFn: () => getGalleryAction(query),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })
}

/**
 * El detalle de un momento. `enabled` cuelga de que haya id porque la ruta lo
 * toma de la URL y puede llegar vacío en el primer render.
 *
 * Sin reintentos: los dos errores posibles son definitivos —404 si el momento
 * no existe, 400 si el id no es un UUID— y reintentar solo demora el cartel.
 */
export const useGalleryAlbum = (id: string | undefined) => {
    return useQuery({
        queryKey: [QK.gallery, 'detail', id],
        queryFn: () => getGalleryAlbumAction(id!),
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 5,
        retry: false,
    })
}

export const useGalleryCategories = () => {
    return useQuery({
        queryKey: [QK.galleryCategories],
        queryFn: getGalleryCategoriesAction,
        staleTime: 1000 * 60 * 30,
    })
}
