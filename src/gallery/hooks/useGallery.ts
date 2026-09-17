import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import {
    getGalleryAlbumAction,
    getGalleryAction,
    getGalleryCategoriesAction,
} from '../actions/get-gallery.action'
import { albumsForGrid, isSameListing, pickFeatured, pickRelated } from '../lib/featured'
import { GALLERY_PAGE_SIZE } from '../lib/gallery-url'
import type { GalleryQuery } from '../interfaces/Gallery'

/**
 * El listado paginado. Lo usa también el panel (AdminGalleryPage): la forma
 * del dato es la de la cache compartida, así que acá no va ningún `select`.
 *
 * `gcTime` de 30 minutos (el default es 5) por el atrás del navegador: para que
 * <ScrollRestoration /> devuelva la altura guardada, la grilla tiene que medir
 * lo mismo que cuando se fue. Si la entrada de cache se tiró mientras la
 * persona miraba las fotos de un momento, al volver el listado arranca vacío y
 * la restauración cae en una página corta: medido con 1,5 s de demora de red,
 * volvía a 4588 px en vez de 3688, con la tarjeta 679 px fuera de pantalla.
 * Media hora es más que cualquier visita a un momento; el `staleTime` de 5
 * minutos no cambia, así que igual se revalida.
 */
export const useGallery = (query: GalleryQuery = {}, { enabled = true }: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: [QK.gallery, query],
        queryFn: () => getGalleryAction(query),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        placeholderData: keepPreviousData,
        enabled,
    })
}

/**
 * El listado público: la página pedida, la portada "Lo más reciente" y la
 * grilla sin repetirla cuando corresponde.
 *
 * La portada sale de `{ page: 1, limit: 12 }` sin categoría. TanStack arma el
 * hash de la key con JSON.stringify, que descarta las propiedades undefined:
 * `{ page: 1, limit: 12, categoryId: undefined }` y `{ page: 1, limit: 12 }` son
 * LA MISMA entrada. En "Todas, página 1" portada y grilla salen de una sola
 * request; con un filtro o en la página 2 la portada es una request más,
 * cacheada 5 minutos.
 *
 * `enabled` espera a que el slug de `?categoria=` se resuelva a un UUID: sin
 * eso la primera request saldría sin filtro y mostraría "Todas" un instante.
 */
export const useGalleryListing = ({
    categoryId,
    page,
    enabled,
}: {
    categoryId: string | undefined
    page: number
    enabled: boolean
}) => {
    const listing = useGallery({ page, limit: GALLERY_PAGE_SIZE, categoryId }, { enabled })
    const cover = useGallery({ page: 1, limit: GALLERY_PAGE_SIZE })

    const featured = pickFeatured(cover.data?.items ?? [])
    const isCover = isSameListing(listing.data, cover.data)
    const albums = albumsForGrid(listing.data?.items ?? [], featured, { isCover })

    return { listing, cover, featured, albums }
}

/**
 * "Más momentos de <categoría>" en la página de un momento.
 *
 * Pide la misma key que el listado filtrado por esa categoría, así que
 * viniendo de `/galeria?categoria=partidos` no sale ninguna request. El
 * `select` corre en este observador y no toca la entrada compartida.
 *
 * SIN `keepPreviousData` a propósito: la página no se desmonta al pasar de un
 * momento a otro, y con relleno se vería la lista de la categoría anterior
 * debajo del título nuevo.
 */
export const useRelatedAlbums = (categoryId: string | undefined, currentId: string) => {
    const query = { page: 1, limit: GALLERY_PAGE_SIZE, categoryId }
    return useQuery({
        queryKey: [QK.gallery, query],
        queryFn: () => getGalleryAction(query),
        staleTime: 1000 * 60 * 5,
        enabled: Boolean(categoryId),
        select: (data) => pickRelated(data.items, currentId),
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
