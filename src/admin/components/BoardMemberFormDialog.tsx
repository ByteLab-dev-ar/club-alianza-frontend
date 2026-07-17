import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import type { BoardMember } from '@/institutional/interfaces/Institutional'
import { useCreateBoardMember, useUpdateBoardMember } from '../hooks/useAdminInstitutional'

const boardMemberSchema = z.object({
    position: z.string().min(2, 'Ingresá el cargo').max(60),
    fullName: z.string().min(2, 'Ingresá el nombre').max(80),
    displayOrder: z.coerce.number<number>().int().min(0).optional(),
})

type BoardMemberSchema = z.infer<typeof boardMemberSchema>

interface Props {
    member?: BoardMember
    /** Orden sugerido para el alta (último + 1). */
    nextOrder?: number
    trigger?: React.ReactNode
}

export const BoardMemberFormDialog = ({ member, nextOrder = 0, trigger }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const isEdit = !!member

    const createMutation = useCreateBoardMember()
    const updateMutation = useUpdateBoardMember(member?.id ?? '')
    const isPending = createMutation.isPending || updateMutation.isPending

    const form = useForm<BoardMemberSchema>({
        resolver: zodResolver(boardMemberSchema),
        defaultValues: {
            position: member?.position ?? '',
            fullName: member?.fullName ?? '',
            displayOrder: member?.displayOrder ?? nextOrder,
        },
    })

    const onSubmit = async (values: BoardMemberSchema) => {
        try {
            if (isEdit) {
                await updateMutation.mutateAsync(values)
                toast.success('Miembro actualizado')
            } else {
                await createMutation.mutateAsync(values)
                toast.success('Miembro agregado')
                form.reset()
            }
            setIsOpen(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos guardar el miembro'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="hero">
                        <Plus /> Agregar miembro
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        {isEdit ? 'Editar miembro' : 'Agregar miembro'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cargo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. PRESIDENTE" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Ricardo Méndez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="displayOrder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Orden de aparición</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={0} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="hero" className="mt-2" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Guardar' : 'Agregar'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
