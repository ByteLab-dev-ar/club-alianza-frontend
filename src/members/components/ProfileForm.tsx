import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { updateProfileAction } from '../actions/profile.actions'
import { PROFILE_QUERY_KEY } from '../hooks/useProfile'
import type { MemberProfile } from '../interfaces/MemberProfile'

const profileSchema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(25, 'Máximo 25 caracteres'),
    surname: z.string().min(2, 'Mínimo 2 caracteres').max(25, 'Máximo 25 caracteres'),
    dni: z
        .string()
        .regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números')
        .optional()
        .or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    bornDate: z.string().optional(),
})

type ProfileSchema = z.infer<typeof profileSchema>

interface Props {
    profile: MemberProfile
}

export const ProfileForm = ({ profile }: Props) => {
    const queryClient = useQueryClient()

    // El DNI se carga una sola vez: si ya está, el backend devuelve 409 y solo un
    // admin puede corregirlo. Por eso el campo se bloquea en vez de dejar reintentar.
    const isDniLocked = !!profile.dni

    const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: profile.name ?? '',
            surname: profile.surname ?? '',
            dni: profile.dni ?? '',
            phone: profile.phone ?? '',
            address: profile.address ?? '',
            bornDate: profile.bornDate ? profile.bornDate.slice(0, 10) : '',
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateProfileAction,
        onSuccess: (updated) => {
            queryClient.setQueryData(PROFILE_QUERY_KEY, updated)
            toast.success('Perfil actualizado')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos guardar los cambios')),
    })

    const onSubmit = (values: ProfileSchema) => {
        mutate({
            name: values.name,
            surname: values.surname,
            // Los opcionales vacíos no se mandan: el backend rechaza strings vacíos
            // y no tiene sentido "borrar" un dato mandando "".
            ...(values.phone ? { phone: values.phone } : {}),
            ...(values.address ? { address: values.address } : {}),
            ...(values.bornDate ? { bornDate: values.bornDate } : {}),
            ...(!isDniLocked && values.dni ? { dni: values.dni } : {}),
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
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
                    name="dni"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>DNI</FormLabel>
                            <FormControl>
                                <Input
                                    inputMode="numeric"
                                    placeholder="38452119"
                                    disabled={isDniLocked}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                {isDniLocked
                                    ? 'El DNI ya está cargado. Para corregirlo, escribinos desde Contacto.'
                                    : 'Se puede cargar una sola vez: después solo lo corrige el club.'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input placeholder="+54 9 11 4567-8910" {...field} />
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

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Domicilio</FormLabel>
                            <FormControl>
                                <Input placeholder="Av. Belgrano 1234, CABA" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" variant="hero" className="w-fit" disabled={isPending}>
                    {isPending && <Loader2 className="animate-spin" />}
                    {isPending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
            </form>
        </Form>
    )
}
