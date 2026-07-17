import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { useGalleryCategories } from '@/gallery/hooks/useGallery'
import { useUploadImage } from '../hooks/useAdminGallery'

const NO_CATEGORY = 'none'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const uploadSchema = z.object({
    title: z.string().min(2, 'Mínimo 2 caracteres'),
    description: z.string().optional(),
    date: z.string().optional(),
    categoryId: z.string(),
})

type UploadSchema = z.infer<typeof uploadSchema>

export const UploadImageDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)

    const { data: categories = [] } = useGalleryCategories()
    const { mutateAsync, isPending } = useUploadImage()

    const form = useForm<UploadSchema>({
        resolver: zodResolver(uploadSchema),
        defaultValues: { title: '', description: '', date: '', categoryId: NO_CATEGORY },
    })

    const onSubmit = async (values: UploadSchema) => {
        if (!file) {
            toast.error('Elegí una imagen')
            return
        }
        try {
            await mutateAsync({
                title: values.title,
                description: values.description || undefined,
                date: values.date || undefined,
                categoryId: values.categoryId === NO_CATEGORY ? undefined : values.categoryId,
                file,
            })
            toast.success('Imagen subida')
            form.reset()
            setFile(null)
            setIsOpen(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos subir la imagen'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="hero">
                    <ImagePlus /> Subir imagen
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">Subir imagen</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Sumá una foto a la galería. JPG, PNG o WebP, máximo 5MB.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
                        <div className="grid gap-2">
                            <FormLabel>Imagen</FormLabel>
                            <Input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="py-2"
                                onChange={(event) => {
                                    const selected = event.target.files?.[0] ?? null
                                    if (selected && selected.size > MAX_IMAGE_SIZE) {
                                        toast.error('La imagen no puede superar los 5MB')
                                        return
                                    }
                                    setFile(selected)
                                }}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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

                        <Button type="submit" variant="hero" className="mt-2" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            Subir imagen
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
