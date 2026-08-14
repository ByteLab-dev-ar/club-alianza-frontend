import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { GalleryAlbum, GalleryCategory } from '@/gallery/interfaces/Gallery'

/**
 * Tope de fotos por momento del backend. Vive acá porque es propio de la
 * galería; el tamaño y los tipos por archivo son los de siempre y salen de
 * `@/shared/lib/file-validation`.
 */
export const MAX_GALLERY_IMAGES = 5

export interface AlbumPayload {
    title: string
    description?: string | null
    date?: string | null
    categoryId?: string | null
}

const NULLABLE_FIELDS = ['description', 'date', 'categoryId'] as const

/**
 * Arma el body distinguiendo "no lo toques" de "vacialo".
 *
 * Son tres casos y el backend los trata distinto: omitir el campo deja el valor
 * como está, mandar `null` lo borra, y mandar `""` es la trampa — en `date` y
 * `categoryId` da 400, pero en `description` **pasa la validación y guarda el
 * string vacío**, con lo que terminás con dos representaciones de "sin
 * descripción" conviviendo en la base.
 *
 * Por eso el `""` que llega del formulario se traduce a `null` acá y no en la
 * pantalla: es el único lugar por el que pasan todas las escrituras.
 *
 * `title` queda afuera del tratamiento: es el único que no acepta `null`.
 */
const compact = (payload: AlbumPayload): Record<string, string | null> => {
    const body: Record<string, string | null> = { title: payload.title }

    for (const field of NULLABLE_FIELDS) {
        const value = payload[field]
        if (value === undefined) continue
        body[field] = value === '' ? null : value
    }

    return body
}

/**
 * POST /admin/gallery — crea el momento **sin fotos**.
 *
 * Es a propósito del backend: las fotos van en un segundo paso, así un título
 * mal escrito no obliga a volver a subir 25 MB. El momento puede quedar sin
 * ninguna foto si alguien abandona a mitad.
 */
export const createAlbumAction = async (payload: AlbumPayload) => {
    const response = await clubApi.post<ApiResponse<GalleryAlbum>>(
        '/admin/gallery',
        compact(payload),
    )
    return unwrap(response)
}

/** PATCH /admin/gallery/:id — mismos campos, todos opcionales. */
export const updateAlbumAction = async ({ id, ...payload }: AlbumPayload & { id: string }) => {
    const response = await clubApi.patch<ApiResponse<GalleryAlbum>>(
        `/admin/gallery/${id}`,
        compact(payload),
    )
    return unwrap(response)
}

/** DELETE /admin/gallery/:id — borra el momento y sus fotos, base y storage. */
export const deleteAlbumAction = async (id: string) => {
    await clubApi.delete(`/admin/gallery/${id}`)
}

/**
 * POST /admin/gallery/:id/images — todas las fotos en UNA sola petición.
 *
 * El campo es `files`, en plural y repetido. Subirlas de a una es un bug: el
 * tope de 5 se valida por lote, así que cinco peticiones en paralelo pasan las
 * cinco el chequeo de "¿hay lugar?" y el momento termina con más fotos de las
 * permitidas.
 *
 * Devuelve el momento actualizado; usarlo para refrescar en vez de recalcular,
 * porque la portada pudo haber cambiado.
 */
export const uploadAlbumImagesAction = async ({ id, files }: { id: string; files: File[] }) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const response = await clubApi.post<ApiResponse<GalleryAlbum>>(
        `/admin/gallery/${id}/images`,
        formData,
    )
    return unwrap(response)
}

/**
 * PATCH /admin/gallery/:id/images/order — reordena, y con eso elige la portada.
 *
 * No hay campo "portada" ni endpoint aparte: la portada es siempre la primera
 * foto, así que cambiarla es reordenar.
 *
 * `imageIds` va **completa y exacta**: es el estado final, no un pedido de
 * "mové esta a la posición 2". Si falta alguna, sobra o hay repetidas, da 400 y
 * no cambia nada. Es a propósito — mover una foto corre a las demás, y un
 * pedido parcial obligaría al servidor a adivinar dónde van las otras, dejando
 * huecos o empates justo en el orden del que sale la portada.
 */
export const reorderAlbumImagesAction = async ({
    id,
    imageIds,
}: {
    id: string
    imageIds: string[]
}) => {
    const response = await clubApi.patch<ApiResponse<GalleryAlbum>>(
        `/admin/gallery/${id}/images/order`,
        { imageIds },
    )
    return unwrap(response)
}

/**
 * DELETE /admin/gallery/:id/images/:imageId — necesita los dos ids.
 *
 * Devuelve el momento actualizado, y ahí está lo importante: si la foto borrada
 * era la primera, la portada cambió. Sacarla de la lista local deja la tarjeta
 * mostrando una portada que ya no existe.
 */
export const deleteAlbumImageAction = async ({
    id,
    imageId,
}: {
    id: string
    imageId: string
}) => {
    const response = await clubApi.delete<ApiResponse<GalleryAlbum>>(
        `/admin/gallery/${id}/images/${imageId}`,
    )
    return unwrap(response)
}

// --- Categorías de galería ---

export const createGalleryCategoryAction = async (payload: { name: string; color: string }) => {
    const response = await clubApi.post<ApiResponse<GalleryCategory>>(
        '/admin/gallery/categories',
        payload,
    )
    return unwrap(response)
}

export const updateGalleryCategoryAction = async ({
    id,
    ...payload
}: {
    id: string
    name?: string
    color?: string
}) => {
    const response = await clubApi.patch<ApiResponse<GalleryCategory>>(
        `/admin/gallery/categories/${id}`,
        payload,
    )
    return unwrap(response)
}

/** Borrar una categoría NO borra los momentos: quedan con `category: null`. */
export const deleteGalleryCategoryAction = async (id: string) => {
    await clubApi.delete(`/admin/gallery/categories/${id}`)
}
