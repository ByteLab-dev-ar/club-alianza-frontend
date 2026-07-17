import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { useGallery, useGalleryCategories } from '@/gallery/hooks/useGallery'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { UploadImageDialog } from '../components/UploadImageDialog'
import { CategoryManagerDialog } from '../components/CategoryManagerDialog'
import {
    useCreateGalleryCategory,
    useDeleteGalleryCategory,
    useDeleteImage,
} from '../hooks/useAdminGallery'

export const AdminGalleryPage = () => {
    const { data, isLoading, isError } = useGallery({ limit: 50 })
    const { data: categories = [] } = useGalleryCategories()
    const deleteMutation = useDeleteImage()
    const createCategory = useCreateGalleryCategory()
    const deleteCategory = useDeleteGalleryCategory()

    const images = data?.items ?? []

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success('Imagen eliminada')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos eliminar la imagen'))
        }
    }

    return (
        <>
            <AdminPageHeader
                kicker="Contenido"
                title="Galería"
                actions={
                    <>
                        <CategoryManagerDialog
                            title="Categorías de galería"
                            categories={categories}
                            onCreate={(payload) => createCategory.mutateAsync(payload)}
                            onDelete={(id) => deleteCategory.mutateAsync(id)}
                            isMutating={createCategory.isPending}
                        />
                        <UploadImageDialog />
                    </>
                }
            />

            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton key={index} className="aspect-square rounded-xl" />
                    ))}
                </div>
            ) : isError ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    No pudimos cargar la galería. Probá recargar en unos minutos.
                </p>
            ) : images.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Todavía no hay imágenes cargadas.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image) => (
                        <div
                            key={image.id}
                            className="group relative overflow-hidden rounded-xl border bg-card shadow-soft"
                        >
                            <img
                                src={image.imageUrl}
                                alt={image.title}
                                className="aspect-square w-full object-cover"
                                loading="lazy"
                            />
                            <div className="p-3">
                                <p className="truncate text-sm font-semibold text-ink">
                                    {image.title}
                                </p>
                                {image.category && (
                                    <span
                                        className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                                        style={{
                                            backgroundColor: `${image.category.color}1f`,
                                            color: image.category.color,
                                        }}
                                    >
                                        {image.category.name}
                                    </span>
                                )}
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <ConfirmDialog
                                    trigger={
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="size-8 shadow-md"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    }
                                    title="Eliminar imagen"
                                    description={`Se eliminará "${image.title}" de la galería. Esta acción no se puede deshacer.`}
                                    confirmLabel="Eliminar"
                                    destructive
                                    onConfirm={() => handleDelete(image.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
