import { useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { createMemberSchema, type CreateMemberSchema } from '../schemas/member.schema'
import { useCreateMember, useUpdateMember } from '../hooks/useMembers'
import type { AdminMember, UpdateMemberPayload } from '../interfaces/AdminMember'

interface Props {
    /** Presente = edición; ausente = alta. */
    member?: AdminMember
    trigger?: React.ReactNode
}

/** Quita los campos vacíos: el backend rechaza '' y no tiene sentido pisar con vacío. */
const cleanPayload = (values: CreateMemberSchema): UpdateMemberPayload & { email?: string } => {
    const entries = Object.entries(values).filter(([, value]) => value !== '')
    return Object.fromEntries(entries)
}

export const MemberFormDialog = ({ member, trigger }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const isEdit = !!member

    const createMutation = useCreateMember()
    const updateMutation = useUpdateMember(member?.id ?? '')
    const mutation = isEdit ? updateMutation : createMutation

    const form = useForm<CreateMemberSchema>({
        // En edición el email queda oculto y no se valida; el schema de alta sirve
        // para ambos porque los demás campos son iguales.
        resolver: zodResolver(createMemberSchema) as Resolver<CreateMemberSchema>,
        defaultValues: {
            email: member?.email ?? '',
            name: member?.name ?? '',
            surname: member?.surname ?? '',
            dni: member?.dni ?? '',
            phone: member?.phone ?? '',
            address: member?.address ?? '',
            bornDate: member?.bornDate?.slice(0, 10) ?? '',
            memberNumber: member?.memberNumber ?? '',
            expirationDate: member?.expirationDate?.slice(0, 10) ?? '',
        },
    })

    const onSubmit = async (values: CreateMemberSchema) => {
        try {
            if (isEdit) {
                const { email: _email, ...rest } = cleanPayload(values)
                void _email
                await updateMutation.mutateAsync(rest)
                toast.success('Socio actualizado')
            } else {
                await createMutation.mutateAsync({
                    email: values.email,
                    ...cleanPayload(values),
                } as CreateMemberSchema)
                toast.success('Socio creado. Le enviamos un mail de bienvenida.')
                form.reset()
            }
            setIsOpen(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos guardar el socio'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="hero">
                        <Plus /> Nuevo socio
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        {isEdit ? 'Editar socio' : 'Nuevo socio'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEdit
                            ? 'Actualizá los datos del socio, incluido el número y el vencimiento.'
                            : 'Se crea la cuenta y se envía un mail de bienvenida para que configure su contraseña.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="socio@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="surname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="dni"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>DNI</FormLabel>
                                        <FormControl>
                                            <Input inputMode="numeric" placeholder="38452119" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bornDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de nacimiento</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+54 9 11 ..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Domicilio</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="memberNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>N° de socio</FormLabel>
                                        <FormControl>
                                            <Input placeholder="00482" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expirationDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vencimiento de cuota</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="hero"
                            className="mt-2"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending && <Loader2 className="animate-spin" />}
                            {isEdit ? 'Guardar cambios' : 'Crear socio'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
