import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { createStaffSchema, type CreateStaffSchema } from '../schemas/staff.schema'
import { useCreateStaff, useInviteStaff } from '../hooks/useStaff'
import { RoleCheckboxes } from './RoleCheckboxes'

type Mode = 'invite' | 'create'

export const StaffFormDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<Mode>('invite')

    const createMutation = useCreateStaff()
    const inviteMutation = useInviteStaff()
    const isPending = createMutation.isPending || inviteMutation.isPending

    // Un solo form: en modo invitación la contraseña se ignora. Se valida siempre
    // con el schema de alta y, si es invitación, se descarta el campo password.
    const form = useForm<CreateStaffSchema>({
        resolver: zodResolver(createStaffSchema),
        defaultValues: { name: '', surname: '', email: '', password: '', roles: [] },
    })

    const selectedRoles = form.watch('roles')

    const onSubmit = async (values: CreateStaffSchema) => {
        try {
            if (mode === 'create') {
                await createMutation.mutateAsync(values)
                toast.success('Administrador creado')
            } else {
                const { password: _password, ...invite } = values
                void _password
                await inviteMutation.mutateAsync(invite)
                toast.success('Invitación enviada por email')
            }
            form.reset()
            setIsOpen(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos completar la operación'))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="hero">
                    <Plus /> Nuevo administrador
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        Nuevo administrador
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Sumá personal al panel. Podés invitarlo por mail (define su propia
                        contraseña) o crearlo con una contraseña que definas vos.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)} className="mt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value="invite">Invitar por email</TabsTrigger>
                        <TabsTrigger value="create">Crear con contraseña</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
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

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="staff@clubalianza.com.ar" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {mode === 'create' && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Mín. 6, con mayús/número/símbolo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="roles"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Roles</FormLabel>
                                    <RoleCheckboxes
                                        value={selectedRoles}
                                        onChange={(roles) =>
                                            // RoleCheckboxes solo emite roles de staff, pero su tipo
                                            // es Role[] (más amplio). El schema ya valida el contenido.
                                            form.setValue(
                                                'roles',
                                                roles as CreateStaffSchema['roles'],
                                                { shouldValidate: true },
                                            )
                                        }
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" variant="hero" className="mt-2" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {mode === 'create' ? 'Crear administrador' : 'Enviar invitación'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
