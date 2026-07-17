import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'
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
import { useEventCategories } from '@/events/hooks/useEventCategories'
import type { ClubEvent } from '@/events/interfaces/ClubEvent'
import { useCreateEvent, useUpdateEvent } from '../hooks/useAdminEvents'

const NO_CATEGORY = 'none'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const eventSchema = z.object({
    title: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    description: z.string().max(2000).optional(),
    date: z.string().min(1, 'Elegí la fecha'),
    time: z.string().min(1, 'Ingresá la hora'),
    location: z.string().min(2, 'Ingresá el lugar').max(120),
    categoryId: z.string(),
})

type EventSchema = z.infer<typeof eventSchema>

interface Props {
    event?: ClubEvent
    trigger?: React.ReactNode
}

export const EventFormDialog = ({ event, trigger }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const isEdit = !!event

    const { data: categories = [] } = useEventCategories()
    const createMutation = useCreateEvent()
    const updateMutation = useUpdateEvent(event?.id ?? '')
    const isPending = createMutation.isPending || updateMutation.isPending

    const form = useForm<EventSchema>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: event?.title ?? '',
            description: event?.description ?? '',
            date: event?.date?.slice(0, 10) ?? '',
            time: event?.time ?? '',
            location: event?.location ?? '',
            categoryId: event?.category?.id ?? NO_CATEGORY,
        },
    })

    const onSubmit = async (values: EventSchema) => {
        const categoryId = values.categoryId === NO_CATEGORY ? undefined : values.categoryId
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ ...values, categoryId })
                toast.success('Evento actualizado')
            } else {
                await createMutation.mutateAsync({ ...values, categoryId, file })
                toast.success('Evento creado')
                form.reset()
                setFile(null)
            }
            setIsOpen(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos guardar el evento'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="hero">
                        <Plus /> Nuevo evento
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        {isEdit ? 'Editar evento' : 'Nuevo evento'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEdit
                            ? 'Actualizá los datos del evento. La imagen no se reemplaza desde acá.'
                            : 'Cargá un evento del calendario. La imagen es opcional.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
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
                                        <Textarea rows={3} {...field} />
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
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora</FormLabel>
                                        <FormControl>
                                            <Input placeholder="16:00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lugar</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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

                        {!isEdit && (
                            <div className="grid gap-2">
                                <FormLabel>Imagen (opcional)</FormLabel>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="py-2"
                                    onChange={(fileEvent) => {
                                        const selected = fileEvent.target.files?.[0] ?? null
                                        if (selected && selected.size > MAX_IMAGE_SIZE) {
                                            toast.error('La imagen no puede superar los 5MB')
                                            return
                                        }
                                        setFile(selected)
                                    }}
                                />
                            </div>
                        )}

                        <Button type="submit" variant="hero" className="mt-2" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Guardar cambios' : 'Crear evento'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
