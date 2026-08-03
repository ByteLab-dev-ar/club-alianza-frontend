import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
import { useEventCategories } from '@/events/hooks/useEventCategories'
import type { ClubEvent } from '@/events/interfaces/ClubEvent'
import { useCreateEvent, useUpdateEvent } from '../hooks/useAdminEvents'

const NO_CATEGORY = 'none'

const eventSchema = z.object({
    title: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    description: z.string().max(2000).optional(),
    date: z.string().min(1, 'Elegí la fecha'),
    // El input es type="time", que ya entrega HH:MM. El regex es la red por si
    // llega un valor viejo con otro formato: antes cualquier texto pasaba y
    // terminaba publicado tal cual en la agenda pública.
    time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Ingresá la hora en formato HH:MM'),
    location: z.string().min(2, 'Ingresá el lugar').max(120),
    categoryId: z.string(),
    // El archivo va dentro del form (y no en un useState aparte) para que las
    // reglas de tamaño y tipo se vean como error del campo, y para que no pueda
    // quedar desfasado de lo que muestra el input.
    file: z
        .instanceof(File)
        .refine((image) => image.size <= MAX_UPLOAD_SIZE, 'La imagen no puede superar los 5MB')
        .refine((image) => IMAGE_TYPES.includes(image.type), 'Solo se aceptan JPG, PNG o WebP')
        .optional(),
})

type EventSchema = z.infer<typeof eventSchema>

interface Props {
    event?: ClubEvent
    trigger?: React.ReactNode
}

export const EventFormDialog = ({ event, trigger }: Props) => {
    const isEdit = !!event

    const { data: categories = [] } = useEventCategories()
    const createMutation = useCreateEvent()
    const updateMutation = useUpdateEvent(event?.id ?? '')

    const buildDefaults = (): EventSchema => ({
        title: event?.title ?? '',
        description: event?.description ?? '',
        date: event?.date?.slice(0, 10) ?? '',
        time: event?.time ?? '',
        location: event?.location ?? '',
        categoryId: event?.category?.id ?? NO_CATEGORY,
        file: undefined,
    })

    const form = useForm<EventSchema>({
        resolver: zodResolver(eventSchema),
        defaultValues: buildDefaults(),
    })

    const onSubmit = (values: EventSchema) => {
        const categoryId = values.categoryId === NO_CATEGORY ? undefined : values.categoryId

        if (isEdit) {
            // La imagen no se reemplaza desde la edición.
            const { file: _file, ...rest } = values
            void _file
            return updateMutation.mutateAsync({ ...rest, categoryId })
        }

        return createMutation.mutateAsync({ ...values, categoryId })
    }

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title={isEdit ? 'Editar evento' : 'Nuevo evento'}
            description={
                isEdit
                    ? 'Actualizá los datos del evento. La imagen no se reemplaza desde acá.'
                    : 'Cargá un evento del calendario. La imagen es opcional.'
            }
            trigger={trigger}
            triggerLabel="Nuevo evento"
            submitLabel={isEdit ? 'Guardar cambios' : 'Crear evento'}
            successMessage={isEdit ? 'Evento actualizado' : 'Evento creado'}
            errorFallback="No pudimos guardar el evento"
            isPending={createMutation.isPending || updateMutation.isPending}
            contentClassName="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <TextField control={form.control} name="title" label="Título" />
            <TextField control={form.control} name="description" label="Descripción" multiline />

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="date" label="Fecha" type="date" />
                <TextField control={form.control} name="time" label="Hora" type="time" />
            </div>

            <TextField control={form.control} name="location" label="Lugar" />

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

            {!isEdit && (
                <FormField
                    control={form.control}
                    name="file"
                    // `field` trae value/onChange pensados para inputs de texto: un
                    // <input type="file"> es no controlado, así que solo enganchamos onChange.
                    render={({ field: { onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>Imagen (opcional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="py-2"
                                    onChange={(fileEvent) => onChange(fileEvent.target.files?.[0])}
                                    {...field}
                                    value={undefined}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </FormDialog>
    )
}
