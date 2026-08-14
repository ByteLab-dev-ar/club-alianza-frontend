import { useForm, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import { useGalleryCategories } from '@/gallery/hooks/useGallery'
import type { GalleryAlbumListItem } from '@/gallery/interfaces/Gallery'
import { useCreateAlbum, useUpdateAlbum } from '../hooks/useAdminGallery'

const NO_CATEGORY = 'none'

/**
 * Solo los datos del momento. Las fotos van en un segundo paso, a propósito:
 * si fueran el mismo formulario, un título mal escrito obligaría a volver a
 * subir hasta 25 MB.
 */
const albumSchema = z.object({
    title: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
    date: z.string().optional(),
    categoryId: z.string(),
})

type AlbumSchema = z.infer<typeof albumSchema>

interface Props {
    /** Sin esto el diálogo crea; con esto, edita. */
    album?: GalleryAlbumListItem
    trigger?: React.ReactNode
}

export const AlbumFormDialog = ({ album, trigger }: Props) => {
    const { data: categories = [] } = useGalleryCategories()
    const createAlbum = useCreateAlbum()
    const updateAlbum = useUpdateAlbum()

    const isEdit = Boolean(album)
    const isPending = createAlbum.isPending || updateAlbum.isPending

    const buildDefaults = (): DefaultValues<AlbumSchema> => ({
        title: album?.title ?? '',
        description: album?.description ?? '',
        /**
         * El `slice` no es paranoia: el backend NO devuelve el mismo formato en
         * todas las rutas. El listado manda `"2026-08-06"` (día calendario, que
         * es lo que dice el contrato), pero las escrituras devuelven el ISO
         * completo `"2026-08-13T00:00:00.000Z"` — verificado contra la API
         * corriendo el 13/08/2026.
         *
         * Un `<input type="date">` con un ISO completo no muestra error: se
         * queda en blanco. Así que si algún día un objeto recién escrito llega
         * hasta este formulario, la fecha desaparecería sin avisar y guardar
         * volvería a mandarla vacía. Cortar a 10 caracteres sirve para los dos
         * formatos y no depende de cuál llegue.
         */
        date: album?.date?.slice(0, 10) ?? '',
        categoryId: album?.category?.id ?? NO_CATEGORY,
    })

    const form = useForm<AlbumSchema>({
        resolver: zodResolver(albumSchema),
        defaultValues: buildDefaults(),
    })

    /**
     * Crear y editar mandan cosas distintas ante un campo en blanco.
     *
     * Al crear no hay nada que vaciar, así que lo vacío no viaja. Al editar, un
     * campo que quedó en blanco significa "borralo", y eso se expresa mandándolo
     * como cadena vacía: la action lo traduce a `null`, que es lo único que el
     * backend entiende como vaciar. Omitirlo ahí significaría "no lo toques" y
     * el valor viejo quedaría intacto.
     */
    const onSubmit = (values: AlbumSchema) => {
        const categoryId = values.categoryId === NO_CATEGORY ? '' : values.categoryId

        if (!isEdit) {
            return createAlbum.mutateAsync({
                title: values.title,
                description: values.description || undefined,
                date: values.date || undefined,
                categoryId: categoryId || undefined,
            })
        }

        return updateAlbum.mutateAsync({
            id: album!.id,
            title: values.title,
            description: values.description ?? '',
            date: values.date ?? '',
            categoryId,
        })
    }

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title={isEdit ? 'Editar momento' : 'Nuevo momento'}
            description={
                isEdit
                    ? 'Cambiá los datos del momento. Las fotos se administran aparte.'
                    : 'Primero los datos. Cuando lo guardes vas a poder subirle las fotos.'
            }
            trigger={
                trigger ?? (
                    <Button variant="hero">
                        <Plus /> Nuevo momento
                    </Button>
                )
            }
            submitLabel={isEdit ? 'Guardar cambios' : 'Crear momento'}
            successMessage={isEdit ? 'Momento actualizado' : 'Momento creado'}
            errorFallback={isEdit ? 'No pudimos guardar los cambios' : 'No pudimos crear el momento'}
            isPending={isPending}
            contentClassName="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <TextField control={form.control} name="title" label="Título" />
            <TextField
                control={form.control}
                name="description"
                label="Descripción"
                multiline
                rows={2}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="date" label="Fecha" type="date" />

                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sin categoría" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={NO_CATEGORY}>Sin categoría</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </FormDialog>
    )
}
