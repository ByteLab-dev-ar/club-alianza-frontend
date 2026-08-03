import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getGalleryAction, getGalleryCategoriesAction } from '../actions/get-gallery.action'
import type { GalleryQuery } from '../interfaces/Gallery'

export const useGallery = (query: GalleryQuery = {}) => {
    return useQuery({
        queryKey: [QK.gallery, query],
        queryFn: () => getGalleryAction(query),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })
}

export const useGalleryCategories = () => {
    return useQuery({
        queryKey: [QK.galleryCategories],
        queryFn: getGalleryCategoriesAction,
        staleTime: 1000 * 60 * 30,
    })
}
