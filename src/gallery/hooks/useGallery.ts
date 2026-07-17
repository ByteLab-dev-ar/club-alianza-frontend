import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getGalleryAction, getGalleryCategoriesAction } from '../actions/get-gallery.action'
import type { GalleryQuery } from '../interfaces/Gallery'

export const useGallery = (query: GalleryQuery = {}) => {
    return useQuery({
        queryKey: ['gallery', query],
        queryFn: () => getGalleryAction(query),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    })
}

export const useGalleryCategories = () => {
    return useQuery({
        queryKey: ['gallery-categories'],
        queryFn: getGalleryCategoriesAction,
        staleTime: 1000 * 60 * 30,
    })
}
