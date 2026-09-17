import { useState } from 'react'
import { Images, Pencil, Trash2 } from 'lucide-react'

import { formatCalendarDate } from '@/lib/format'
import { usePageInRange } from '@/lib/usePageInRange'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { Pagination } from '@/components/custom/Pagination'
import { useGallery, useGalleryCategories } from '@/gallery/hooks/useGallery'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AlbumFormDialog } from '../components/AlbumFormDialog'
import { AlbumImagesDialog } from '../components/AlbumImagesDialog'
import { CategoryManagerDialog } from '../components/CategoryManagerDialog'
import {
    useCreateGalleryCategory,
    useDeleteAlbum,
    useDeleteGalleryCategory,
} from '../hooks/useAdminGallery'

const PAGE_SIZE = 24

export const AdminGalleryPage = () => {
    const [page, setPage] = useState(1)
    // La galería crece sin techo: sin paginar, los momentos más viejos quedaban
    // fuera del panel y no había forma de editarlos ni borrarlos.
    const { data, isLoading, isError, isPlaceholderData } = useGallery({ page, limit: PAGE_SIZE })
    // Borrar el único momento de la última página dejaba la pantalla en
    // "Todavía no hay momentos cargados." y sin paginación para volver.
    const { isSettling } = usePageInRange({ page, data, isPlaceholderData, onPageChange: setPage })
    const { data: categories = [] } = useGalleryCategories()
    const deleteAlbum = useDeleteAlbum()
    const createCategory = useCreateGalleryCategory()
    const deleteCategory = useDeleteGalleryCategory()

    const albums = data?.items ?? []

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
                        <AlbumFormDialog />
                    </>
                }
            />

            {isLoading || isSettling ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : isError ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    No pudimos cargar la galería. Probá recargar en unos minutos.
                </p>
            ) : albums.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Todavía no hay momentos cargados.
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft"
                        >
                            {album.coverUrl ? (
                                <img
                                    src={album.coverUrl}
                                    alt={album.title}
                                    className="aspect-4/3 w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                /* Un momento nace sin fotos: el estado vacío es normal
                                   y hay que poder distinguirlo de un error de carga. */
                                <span className="grid aspect-4/3 w-full place-items-center bg-muted text-muted-foreground">
                                    <Images className="size-8" />
                                </span>
                            )}

                            <div className="flex flex-1 flex-col p-4">
                                <p className="truncate font-display text-sm font-bold text-ink">
                                    {album.title}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {album.date
                                        ? formatCalendarDate(album.date)
                                        : 'Sin fecha'}
                                </p>

                                {album.category && (
                                    <span
                                        className="mt-2 inline-block w-fit rounded-full px-2 py-0.5 text-[11px] font-bold"
                                        style={{
                                            backgroundColor: `${album.category.color}1f`,
                                            color: album.category.color,
                                        }}
                                    >
                                        {album.category.name}
                                    </span>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                                    <AlbumImagesDialog album={album} />

                                    <AlbumFormDialog
                                        album={album}
                                        trigger={
                                            <Button variant="ghost" size="sm">
                                                <Pencil className="size-4" /> Editar
                                            </Button>
                                        }
                                    />

                                    <ConfirmDialog
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-auto size-8 text-destructive hover:bg-destructive/10"
                                                aria-label={`Eliminar ${album.title}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        }
                                        title="Eliminar momento"
                                        // El borrado se lleva las fotos, de la base y del
                                        // storage. Decir cuántas se pierden es la única
                                        // forma de que la confirmación sea informada.
                                        description={
                                            album.imageCount > 0
                                                ? `Se eliminará "${album.title}" junto con sus ${album.imageCount} ${album.imageCount === 1 ? 'foto' : 'fotos'}. Es irreversible.`
                                                : `Se eliminará "${album.title}". Todavía no tiene fotos. Es irreversible.`
                                        }
                                        confirmLabel="Eliminar"
                                        destructive
                                        onConfirm={() => deleteAlbum.mutateAsync(album.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data && !isSettling && (
                <div className="mt-6">
                    <Pagination
                        meta={data.meta}
                        onPageChange={setPage}
                        disabled={isPlaceholderData}
                    />
                </div>
            )}
        </>
    )
}
