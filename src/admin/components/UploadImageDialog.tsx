import { useForm, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { IMAGE_TYPES, MAX_UPLOAD_SIZE } from '@/shared/lib/file-validation'
import { useGalleryCategories } from '@/gallery/hooks/useGallery'
import { useUploadImage } from '../hooks/useAdminGallery'

const NO_CATEGORY = 'none'

const uploadSchema = z.object({
    title: z.string().min(2, 'Mínimo 2 caracteres'),
    description: z.string().optional(),
    date: z.string().optional(),
    categoryId: z.string(),
    // La imagen es obligatoria y va dentro del form: así el error sale en el
    // campo (con aria-invalid) en vez de un toast suelto, y el input no puede
    // quedar mostrando un archivo distinto del que se va a subir.
    file: z
        .instanceof(File, { message: 'Elegí una imagen' })
        .refine((image) => image.size <= MAX_UPLOAD_SIZE, 'La imagen no puede superar los 5MB')
        .refine((image) => IMAGE_TYPES.includes(image.type), 'Solo se aceptan JPG, PNG o WebP'),
})

type UploadSchema = z.infer<typeof uploadSchema>

/**
 * `file` arranca sin valor: es obligatorio en el schema, pero el input de
 * archivo empieza vacío y Zod lo exige recién al enviar.
 */
const buildDefaults = (): DefaultValues<UploadSchema> => ({
    title: '',
    description: '',
    date: '',
    categoryId: NO_CATEGORY,
    file: undefined,
})

export const UploadImageDialog = () => {
    const { data: categories = [] } = useGalleryCategories()
    const { mutateAsync, isPending } = useUploadImage()

    const form = useForm<UploadSchema>({
        resolver: zodResolver(uploadSchema),
        defaultValues: buildDefaults(),
    })

    const onSubmit = (values: UploadSchema) =>
        mutateAsync({
            title: values.title,
            description: values.description || undefined,
            date: values.date || undefined,
            categoryId: values.categoryId === NO_CATEGORY ? undefined : values.categoryId,
            file: values.file,
        })

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title="Subir imagen"
            description="Sumá una foto a la galería. JPG, PNG o WebP, máximo 5MB."
            trigger={
                <Button variant="hero">
                    <ImagePlus /> Subir imagen
                </Button>
            }
            submitLabel="Subir imagen"
            successMessage="Imagen subida"
            errorFallback="No pudimos subir la imagen"
            isPending={isPending}
            contentClassName="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <FormField
                control={form.control}
                name="file"
                // `field` trae value/onChange pensados para inputs de texto: un
                // <input type="file"> es no controlado, así que solo enganchamos onChange.
                render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                        <FormLabel>Imagen</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="py-2"
                                onChange={(event) => onChange(event.target.files?.[0])}
                                {...field}
                                value={undefined}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <TextField control={form.control} name="title" label="Título" />
            <TextField control={form.control} name="description" label="Descripción" multiline rows={2} />

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
