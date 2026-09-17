import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'

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
import { useEventCategories } from '@/events/hooks/useEventCategories'
import type { ClubEvent } from '@/events/interfaces/ClubEvent'
import { eventTimeField } from '../schemas/event-fields'
import { useCreateEvent, useUpdateEvent } from '../hooks/useAdminEvents'

const NO_CATEGORY = 'none'

const eventSchema = z.object({
    title: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
    date: z.string().min(1, 'Elegí la fecha'),
    // Hora y lugar pueden ir vacíos: si el evento tiene flyer, esos datos ya
    // están impresos en la imagen. La regla de la hora es texto libre de hasta
    // 20 y vive aparte, con su test: ver `../schemas/event-fields`.
    time: eventTimeField,
    location: z
        .string()
        .max(120, 'Máximo 120 caracteres')
        .refine(
            (value) => value === '' || value.length >= 2,
            'Ingresá el lugar, o dejalo vacío si está en el flyer',
        ),
    categoryId: z.string(),
    // El archivo va dentro del form (y no en un useState aparte) para que las
    // reglas de tamaño y tipo se vean como error del campo, y para que no pueda
    // quedar desfasado de lo que muestra el input.
    file: z
        .instanceof(File)
        .refine((image) => image.size <= MAX_UPLOAD_SIZE, 'La imagen no puede superar los 5MB')
        .refine((image) => IMAGE_TYPES.includes(image.type), 'Solo se aceptan JPG, PNG o WebP')
        .optional(),
    // Marcar la imagen para borrar es un estado del formulario, no una acción
    // aparte: recién se aplica al guardar, así que se puede deshacer cerrando el
    // diálogo, como cualquier otro cambio que no se confirmó.
    removeImage: z.boolean(),
})

type EventSchema = z.infer<typeof eventSchema>

interface Props {
    event?: ClubEvent
    trigger?: React.ReactNode
}

export const EventFormDialog = ({ event, trigger }: Props) => {
    const isEdit = !!event
    // En una const y no leído en el JSX para que TS lo estreche adentro de los
    // render de FormField, que son callbacks.
    const currentImageUrl = event?.imageUrl ?? null

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
        removeImage: false,
    })

    const form = useForm<EventSchema>({
        resolver: zodResolver(eventSchema),
        defaultValues: buildDefaults(),
    })

    // Mandar un archivo y el pedido de borrado a la vez es un 400 del backend,
    // así que acá directamente no pueden coexistir: con la imagen marcada para
    // borrar no se muestra el selector de archivo, y elegir uno cancela el
    // borrado. Sale del form y no de un useState aparte para que no haya dos
    // fuentes de verdad sobre lo mismo. (useWatch y no form.watch: ver
    // StaffFormDialog, es la API que el compilador de React puede memoizar.)
    const isImageMarkedForRemoval = useWatch({ control: form.control, name: 'removeImage' })

    const markImageForRemoval = () => {
        form.setValue('removeImage', true)
        // Si ya había elegido un reemplazo, se descarta: al ocultarse, el input
        // se desmonta y volvería vacío, pero el valor del form sobrevive.
        form.setValue('file', undefined)
    }

    const onSubmit = (values: EventSchema) => {
        const categoryId = values.categoryId === NO_CATEGORY ? undefined : values.categoryId
        const payload = { ...values, categoryId }

        return isEdit ? updateMutation.mutateAsync(payload) : createMutation.mutateAsync(payload)
    }

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title={isEdit ? 'Editar evento' : 'Nuevo evento'}
            description={
                isEdit
                    ? 'Actualizá los datos y la imagen del evento.'
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
                {/* Campo de texto y no type="time": tiene que aceptar lo que el
                    club escribe cuando el flyer no da una hora exacta. Los
                    ejemplos van en la ayuda y no solo en el placeholder porque
                    al editar un evento el campo llega lleno y el placeholder no
                    se ve nunca, que es justo cuando hace falta saber que el
                    texto libre vale. El "hs" del ejemplo es a propósito: el
                    sitio lo agrega solo cuando el valor ES una hora (ver
                    formatEventTime) y al texto libre lo muestra tal cual. */}
                <TextField
                    control={form.control}
                    name="time"
                    label="Hora (opcional)"
                    placeholder="16:00"
                    description="Ej. 16:00, De 10 a 18 hs o A confirmar."
                    maxLength={20}
                />
            </div>

            <TextField control={form.control} name="location" label="Lugar (opcional)" />

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

            {currentImageUrl && (
                <FormField
                    control={form.control}
                    name="removeImage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Imagen actual</FormLabel>
                            {field.value ? (
                                <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2">
                                    <p className="text-sm text-muted-foreground">
                                        Se elimina al guardar.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => field.onChange(false)}
                                    >
                                        Deshacer
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={currentImageUrl}
                                        alt="Imagen actual del evento"
                                        className="h-16 w-24 shrink-0 rounded-lg border object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={markImageForRemoval}
                                    >
                                        <Trash2 /> Quitar
                                    </Button>
                                </div>
                            )}
                        </FormItem>
                    )}
                />
            )}

            {!isImageMarkedForRemoval && (
                <FormField
                    control={form.control}
                    name="file"
                    // `field` trae value/onChange pensados para inputs de texto: un
                    // <input type="file"> es no controlado, así que solo enganchamos onChange.
                    render={({ field: { onChange, ...field } }) => (
                        <FormItem>
                            <FormLabel>
                                {currentImageUrl ? 'Reemplazar imagen' : 'Imagen'} (opcional)
                            </FormLabel>
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
