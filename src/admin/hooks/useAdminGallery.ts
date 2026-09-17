import { useMutation, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import type { GalleryAlbum } from '@/gallery/interfaces/Gallery'
import { notify } from '@/lib/notify'
import {
    createAlbumAction,
    createGalleryCategoryAction,
    deleteAlbumAction,
    deleteAlbumImageAction,
    deleteGalleryCategoryAction,
    reorderAlbumImagesAction,
    updateAlbumAction,
    updateGalleryCategoryAction,
    uploadAlbumImagesAction,
} from '../actions/gallery.actions'

const useInvalidateGallery = () => {
    const queryClient = useQueryClient()
    return () => {
        void queryClient.invalidateQueries({ queryKey: [QK.gallery] })
        void queryClient.invalidateQueries({ queryKey: [QK.galleryCategories] })
    }
}

/**
 * Las dos operaciones de fotos devuelven el momento completo justamente para no
 * recalcular nada del lado del cliente. Se siembra en la cache del detalle antes
 * de invalidar: así la pantalla ya muestra el estado nuevo —portada incluida—
 * sin esperar el refetch.
 */
const useApplyAlbum = () => {
    const queryClient = useQueryClient()
    const invalidate = useInvalidateGallery()
    return (album: GalleryAlbum) => {
        queryClient.setQueryData([QK.gallery, 'detail', album.id], album)
        invalidate()
    }
}

export const useCreateAlbum = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: createAlbumAction, onSuccess: invalidate })
}

export const useUpdateAlbum = () => {
    const applyAlbum = useApplyAlbum()
    return useMutation({ mutationFn: updateAlbumAction, onSuccess: applyAlbum })
}

/** Ver la nota de useDeleteEvent: el feedback del borrado vive en el hook. */
export const useDeleteAlbum = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({
        mutationFn: deleteAlbumAction,
        onSuccess: () => {
            invalidate()
            notify.success('Momento eliminado')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos eliminar el momento')),
    })
}

/**
 * El backend rechaza el lote entero si no entra, y su `message` ya viene en
 * castellano y listo para mostrar ("Solo entran 2 foto(s) más en este
 * momento"). Se muestra tal cual en vez de escribir uno propio.
 */
export const useUploadAlbumImages = () => {
    const applyAlbum = useApplyAlbum()
    return useMutation({
        mutationFn: uploadAlbumImagesAction,
        onSuccess: (album) => {
            applyAlbum(album)
            notify.success('Fotos subidas')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos subir las fotos')),
    })
}

export const useDeleteAlbumImage = () => {
    const applyAlbum = useApplyAlbum()
    return useMutation({
        mutationFn: deleteAlbumImageAction,
        onSuccess: (album) => {
            applyAlbum(album)
            notify.success('Foto eliminada')
        },
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos eliminar la foto')),
    })
}

/**
 * Sin toast en el éxito: reordenar es una acción que se ve sola —la foto se
 * mueve— y avisarlo en cada clic de flecha llena la pantalla de notificaciones.
 * El error sí avisa, porque ahí no pasa nada visible.
 */
export const useReorderAlbumImages = () => {
    const applyAlbum = useApplyAlbum()
    return useMutation({
        mutationFn: reorderAlbumImagesAction,
        onSuccess: applyAlbum,
        onError: (error) => notify.error(getApiErrorMessage(error, 'No pudimos reordenar las fotos')),
    })
}

// --- Categorías ---

export const useCreateGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: createGalleryCategoryAction, onSuccess: invalidate })
}

export const useUpdateGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: updateGalleryCategoryAction, onSuccess: invalidate })
}

export const useDeleteGalleryCategory = () => {
    const invalidate = useInvalidateGallery()
    return useMutation({ mutationFn: deleteGalleryCategoryAction, onSuccess: invalidate })
}
