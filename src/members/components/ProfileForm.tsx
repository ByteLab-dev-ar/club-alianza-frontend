import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
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
// Mismas reglas que usa el admin para estos campos: antes había una copia local
// más floja acá (teléfono y domicilio sin tope) y el backend devolvía un 400.
import { formatCuil, normalizeCuil } from '@/shared/schemas/fields'
import {
    memberProfileSchema,
    type MemberProfileSchema,
} from '@/admin/schemas/member.schema'
import { useUpdateProfile } from '../hooks/useProfile'
import type { MemberProfile } from '../interfaces/MemberProfile'

interface Props {
    profile: MemberProfile
}

export const ProfileForm = ({ profile }: Props) => {
    // CUIL y DNI se cargan una sola vez: si ya están, el backend devuelve 409 y
    // solo el club puede corregirlos. Por eso se bloquean en vez de dejar
    // reintentar algo que se sabe que va a fallar.
    const isCuilLocked = !!profile.cuil
    const isDniLocked = !!profile.dni

    const form = useForm<MemberProfileSchema>({
        resolver: zodResolver(memberProfileSchema),
        defaultValues: {
            name: profile.name ?? '',
            surname: profile.surname ?? '',
            cuil: formatCuil(profile.cuil),
            dni: profile.dni ?? '',
            phone: profile.phone ?? '',
            address: profile.address ?? '',
            bornDate: profile.bornDate ? profile.bornDate.slice(0, 10) : '',
        },
    })

    const { mutate, isPending } = useUpdateProfile()

    /**
     * Los 409 de este endpoint vienen del CUIL o del DNI, y el único dato para
     * distinguirlos es el texto del mensaje. Se enganchan al campo que
     * corresponde en vez de tirar un toast suelto, para que el error aparezca
     * donde hay que corregirlo.
     *
     * El mensaje del backend se muestra tal cual: ya distingue los casos y está
     * redactado para no servir de oráculo de enumeración (al socio le dice lo
     * mismo exista o no una baja detrás del CUIL tomado).
     */
    const onError = (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            const message = getApiErrorMessage(error, 'Ese dato no se puede usar')
            const field = message.includes('CUIL') ? 'cuil' : message.includes('DNI') ? 'dni' : null

            if (field) {
                form.setError(field, { message })
                return
            }
        }
        toast.error(getApiErrorMessage(error, 'No pudimos guardar los cambios'))
    }

    const onSubmit = (values: MemberProfileSchema) => {
        mutate(
            {
                name: values.name,
                surname: values.surname,
                // Los opcionales vacíos no se mandan: el backend rechaza strings vacíos
                // y no tiene sentido "borrar" un dato mandando "".
                ...(values.phone ? { phone: values.phone } : {}),
                ...(values.address ? { address: values.address } : {}),
                ...(values.bornDate ? { bornDate: values.bornDate } : {}),
                // Normalizado a 11 dígitos: es como lo guarda y lo compara el
                // backend, así que mandarlo con guiones haría que los mensajes de
                // unicidad hablen de un valor distinto al que quedó en la base.
                ...(!isCuilLocked && values.cuil ? { cuil: normalizeCuil(values.cuil) } : {}),
                ...(!isDniLocked && values.dni ? { dni: values.dni } : {}),
            },
            { onError },
        )
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
                    name="cuil"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CUIL</FormLabel>
                            <FormControl>
                                <Input
                                    inputMode="numeric"
                                    placeholder="20-12345678-6"
                                    disabled={isCuilLocked}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                {isCuilLocked
                                    ? 'El CUIL ya está cargado. Para corregirlo, escribinos desde Contacto.'
                                    : 'Es el dato con el que te identifica el club. Se puede cargar una sola vez: después solo lo corrige el club.'}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
