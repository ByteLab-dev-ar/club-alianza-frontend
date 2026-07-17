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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import type { HistoryMilestone } from '@/institutional/interfaces/Institutional'
import { useCreateMilestone, useUpdateMilestone } from '../hooks/useAdminInstitutional'

const milestoneSchema = z.object({
    year: z.coerce
        .number<number>()
        .int('Año inválido')
        .min(1800, 'No puede ser anterior a 1800')
        .max(2100, 'No puede ser posterior a 2100'),
    title: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    description: z.string().min(2, 'Contá algo del hito').max(2000),
})

type MilestoneSchema = z.infer<typeof milestoneSchema>

interface Props {
    milestone?: HistoryMilestone
    trigger?: React.ReactNode
}

export const MilestoneFormDialog = ({ milestone, trigger }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const isEdit = !!milestone

    const createMutation = useCreateMilestone()
    const updateMutation = useUpdateMilestone(milestone?.id ?? '')
    const isPending = createMutation.isPending || updateMutation.isPending

    const form = useForm<MilestoneSchema>({
        resolver: zodResolver(milestoneSchema),
        defaultValues: {
            year: milestone?.year ?? new Date().getFullYear(),
            title: milestone?.title ?? '',
            description: milestone?.description ?? '',
        },
    })

    const onSubmit = async (values: MilestoneSchema) => {
        try {
            if (isEdit) {
                await updateMutation.mutateAsync(values)
                toast.success('Hito actualizado')
            } else {
                await createMutation.mutateAsync(values)
                toast.success('Hito creado')
                form.reset()
            }
            setIsOpen(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos guardar el hito'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="hero">
                        <Plus /> Nuevo hito
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        {isEdit ? 'Editar hito' : 'Nuevo hito'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="year"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Año</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Fundación" {...field} />
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
                        <Button type="submit" variant="hero" className="mt-2" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Guardar' : 'Crear hito'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
