import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import {
    createGalleryCategoryAction,
    deleteGalleryCategoryAction,
    deleteImageAction,
    uploadImageAction,
} from '../actions/gallery.actions'

const useInvalidateGallery = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.gallery] })
        void queryClient.invalidateQueries({ queryKey: [QK.galleryCategories] })
    }
}

export const useUploadImage = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: uploadImageAction, onSuccess: invalidate })
}

/** Ver la nota de useDeleteEvent: el feedback del borrado vive en el hook. */
export const useDeleteImage = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({
        mutationFn: deleteImageAction,
        onSuccess: () => {
            invalidate()
            toast.success('Imagen eliminada')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos eliminar la imagen')),
    })
}

export const useCreateGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: createGalleryCategoryAction, onSuccess: invalidate })
}

export const useDeleteGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: deleteGalleryCategoryAction, onSuccess: invalidate })
}
