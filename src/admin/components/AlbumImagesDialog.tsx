import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Images, Loader2, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { validateUpload } from '@/shared/lib/file-validation'
import { useGalleryAlbum } from '@/gallery/hooks/useGallery'
import type { GalleryAlbumListItem } from '@/gallery/interfaces/Gallery'
import { MAX_GALLERY_IMAGES } from '../actions/gallery.actions'
import {
    useDeleteAlbumImage,
    useReorderAlbumImages,
    useUploadAlbumImages,
} from '../hooks/useAdminGallery'

interface Props {
    album: GalleryAlbumListItem
}

/**
 * El segundo paso: las fotos de un momento.
 *
 * El listado no trae las fotos, así que el detalle se pide recién al abrir.
 * Todo lo que se elija sube en UNA sola petición: el backend valida el tope de
 * 5 por lote, y subir de a una haría que varias peticiones en paralelo pasaran
 * todas el chequeo de "¿hay lugar?" dejando el momento con más de 5.
 */
export const AlbumImagesDialog = ({ album }: Props) => {
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [fileError, setFileError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { data: detail, isLoading } = useGalleryAlbum(open ? album.id : undefined)
    const uploadImages = useUploadAlbumImages()
    const deleteImage = useDeleteAlbumImage()
    const reorderImages = useReorderAlbumImages()

    const images = detail?.images ?? []
    const count = detail?.imageCount ?? album.imageCount
    const remaining = MAX_GALLERY_IMAGES - count
    const isFull = remaining <= 0

    const clearSelection = () => {
        setFiles([])
        setFileError(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    /**
     * Se valida antes de mandar por dos motivos: el backend rechaza el lote
     * entero si algo no cumple, y el tope se chequea contra las que ya están.
     * Sin este aviso alguien elige cuatro fotos y no sube ninguna.
     */
    const onSelect = (selected: File[]) => {
        setFileError(null)

        if (selected.length > remaining) {
            setFileError(
                remaining === 1
                    ? 'Solo entra 1 foto más en este momento.'
                    : `Solo entran ${remaining} fotos más en este momento (máximo ${MAX_GALLERY_IMAGES}).`,
            )
            setFiles([])
            return
        }

        const invalid = selected.map((file) => validateUpload(file)).find(Boolean)
        if (invalid) {
            setFileError(invalid)
            setFiles([])
            return
        }

        setFiles(selected)
    }

    const onUpload = async () => {
        if (files.length === 0) return
        await uploadImages.mutateAsync({ id: album.id, files })
        clearSelection()
    }

    /**
     * Mueve una foto y manda el orden resultante completo.
     *
     * El backend espera el estado final, no un "mové esta a la posición N": si
     * la lista viene incompleta, con sobrantes o con repetidos, rechaza el lote
     * entero. Por eso se arma sobre el array que ya tenemos en vez de mandar
     * solo el par que cambió.
     */
    const move = (from: number, to: number) => {
        const imageIds = images.map((image) => image.id)
        const moved = imageIds[from]
        if (moved === undefined) return

        imageIds.splice(from, 1)
        imageIds.splice(to, 0, moved)
        return reorderImages.mutateAsync({ id: album.id, imageIds })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                if (!next) clearSelection()
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Images className="size-4" />
                    {count}/{MAX_GALLERY_IMAGES}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Fotos de "{album.title}"</DialogTitle>
                    <DialogDescription>
                        {isFull
                            ? `Este momento ya tiene las ${MAX_GALLERY_IMAGES} fotos permitidas. Borrá alguna para subir otra.`
                            : `Entran ${remaining} ${remaining === 1 ? 'foto' : 'fotos'} más. JPG, PNG o WebP, máximo 5MB cada una.`}
                        {images.length > 1 && ' La primera es la portada: movelas para cambiarla.'}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="aspect-square rounded-lg" />
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    <p className="rounded-lg border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                        Todavía no subiste ninguna foto a este momento.
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="group relative overflow-hidden rounded-lg border bg-muted"
                            >
                                <img
                                    src={image.imageUrl}
                                    alt={`Foto ${index + 1} de ${album.title}`}
                                    className="aspect-square w-full object-cover"
                                    loading="lazy"
                                />
                                {index === 0 && (
                                    <span className="absolute top-1.5 left-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                        Portada
                                    </span>
                                )}

                                {/* Mover es la única forma de cambiar la portada:
                                    no hay campo aparte, la portada es la primera. */}
                                {images.length > 1 && (
                                    <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                        <Button
                                            variant="dark"
                                            size="icon"
                                            className="size-7"
                                            disabled={index === 0 || reorderImages.isPending}
                                            aria-label={`Mover la foto ${index + 1} hacia atrás`}
                                            onClick={() => void move(index, index - 1)}
                                        >
                                            <ChevronLeft className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="dark"
                                            size="icon"
                                            className="size-7"
                                            disabled={
                                                index === images.length - 1 || reorderImages.isPending
                                            }
                                            aria-label={`Mover la foto ${index + 1} hacia adelante`}
                                            onClick={() => void move(index, index + 1)}
                                        >
                                            <ChevronRight className="size-3.5" />
                                        </Button>
                                    </div>
                                )}
                                <div className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                    <ConfirmDialog
                                        trigger={
                                            <Button variant="destructive" size="icon" className="size-7">
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        }
                                        title="Eliminar foto"
                                        description={
                                            index === 0
                                                ? 'Es la portada del momento: al borrarla, la siguiente pasa a ocupar su lugar.'
                                                : 'Se eliminará esta foto del momento. No se puede deshacer.'
                                        }
                                        confirmLabel="Eliminar"
                                        destructive
                                        // El await descarta el momento que devuelve
                                        // la mutación —ya lo aplica el hook— y deja
                                        // el Promise<void> que espera el diálogo.
                                        onConfirm={async () => {
                                            await deleteImage.mutateAsync({
                                                id: album.id,
                                                imageId: image.id,
                                            })
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-2 flex flex-col gap-3 border-t pt-4">
                    <Input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="py-2"
                        disabled={isFull || uploadImages.isPending}
                        onChange={(event) => onSelect(Array.from(event.target.files ?? []))}
                    />

                    {fileError && <p className="text-sm text-destructive">{fileError}</p>}

                    <Button
                        onClick={() => void onUpload()}
                        disabled={files.length === 0 || uploadImages.isPending}
                        className="w-fit"
                    >
                        {uploadImages.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
                        {files.length > 0
                            ? `Subir ${files.length} ${files.length === 1 ? 'foto' : 'fotos'}`
                            : 'Subir fotos'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
