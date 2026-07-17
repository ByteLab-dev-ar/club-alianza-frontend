import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
    createGalleryCategoryAction,
    deleteGalleryCategoryAction,
    deleteImageAction,
    uploadImageAction,
} from '../actions/gallery.actions'

const useInvalidateGallery = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: ['gallery'] })
        void queryClient.invalidateQueries({ queryKey: ['gallery-categories'] })
    }
}

export const useUploadImage = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: uploadImageAction, onSuccess: invalidate })
}

export const useDeleteImage = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: deleteImageAction, onSuccess: invalidate })
}

export const useCreateGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: createGalleryCategoryAction, onSuccess: invalidate })
}

export const useDeleteGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: deleteGalleryCategoryAction, onSuccess: invalidate })
}
