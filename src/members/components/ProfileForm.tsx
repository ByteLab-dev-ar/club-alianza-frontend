import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

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
import { SelectField } from '@/components/custom/SelectField'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
// Mismas reglas que usa el admin para estos campos: antes había una copia local
// más floja acá (teléfono y domicilio sin tope) y el backend devolvía un 400.
import { formatCuil, normalizeCuil } from '@/shared/schemas/fields'
import {
    memberProfileSchema,
    type MemberProfileSchema,
} from '@/admin/schemas/member.schema'
import { useUpdateProfile } from '../hooks/useProfile'
import { useUpdateWard } from '../hooks/useWards'
import { MEMBER_SEX_OPTIONS, type MemberProfile } from '../interfaces/MemberProfile'

interface Props {
    profile: MemberProfile
    /**
     * Presente = se está editando la ficha de un TUTELADO, que va por otro
     * endpoint: `PATCH /members/profile` resuelve por el token y un menor no
     * tiene cuenta. Los campos y las reglas son exactamente los mismos —el CUIL
     * y el DNI se setean una vez, la ficha se congela en revisión—, así que el
     * formulario es este y lo único que cambia es a dónde escribe.
     */
    wardId?: string
    /**
     * La solicitud está en revisión y la ficha quedó congelada (§1.8): el PATCH
     * responde 409. Se deshabilita el formulario en vez de dejar que la persona
     * escriba, guarde y choque contra el error.
     */
    frozen?: boolean
    /**
     * Qué campo resaltar, del checklist de afiliación. Llega por la query
     * (`?campo=`) para que "te falta el domicilio" lleve al domicilio en vez de
     * dejar a la persona buscándolo entre ocho.
     */
    focusField?: string | null
}

/** Los campos de este formulario, para validar el `?campo=` antes de usarlo. */
const FORM_FIELDS = [
    'name',
    'surname',
    'cuil',
    'dni',
    'phone',
    'address',
    'bornDate',
    'sex',
] as const

type ProfileFormField = (typeof FORM_FIELDS)[number]

const asFormField = (field: string | null | undefined): ProfileFormField | null =>
    FORM_FIELDS.find((name) => name === field) ?? null

export const ProfileForm = ({ profile, wardId, frozen = false, focusField }: Props) => {
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
            sex: profile.sex ?? '',
        },
    })

    // Los dos hooks se llaman SIEMPRE y se elige uno: las reglas de hooks no
    // permiten condicionarlos, y el que no corresponde queda como una mutación
    // que nadie dispara. Es más barato que duplicar doscientas líneas de
    // formulario para cambiar el endpoint de destino.
    const selfMutation = useUpdateProfile()
    const wardMutation = useUpdateWard(wardId ?? '')
    const { mutate, isPending } = wardId ? wardMutation : selfMutation

    const { setFocus } = form
    useEffect(() => {
        const field = asFormField(focusField)
        if (field && !frozen) setFocus(field)
    }, [focusField, frozen, setFocus])

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
        notify.error(getApiErrorMessage(error, 'No pudimos guardar los cambios'))
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
                ...(values.sex ? { sex: values.sex } : {}),
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
                                    <Input disabled={frozen} {...field} />
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
                                    <Input disabled={frozen} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* CUIL y DNI van en la misma fila y no a todo el ancho: son el
                    mismo tipo de dato, los dos se cargan una sola vez y los dos
                    llevan la misma aclaración, así que emparejarlos deja la
                    grilla en dos columnas parejas de arriba a abajo. Mezclar
                    filas de ancho completo con filas partidas era lo que hacía
                    ver el formulario desalineado. */}
                <div className="grid gap-5 sm:grid-cols-2">
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
                                        disabled={frozen || isCuilLocked}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {isCuilLocked
                                        ? 'Ya está cargado. Para corregirlo, escribinos desde Contacto.'
                                        : 'Es con lo que te identifica el club. Se carga una sola vez.'}
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
                                        disabled={frozen || isDniLocked}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {isDniLocked
                                        ? 'Ya está cargado. Para corregirlo, escribinos desde Contacto.'
                                        : 'Se carga una sola vez: después solo lo corrige el club.'}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="bornDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de nacimiento</FormLabel>
                                <FormControl>
                                    <Input type="date" disabled={frozen} {...field} />
                                </FormControl>
                                {/* Va con aclaración para que la fila quede
                                    pareja con la de al lado, y de paso dice algo
                                    cierto: la categoría sale de acá. */}
                                <FormDescription>
                                    Si jugás, de acá sale tu categoría.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Es un dato del padrón y nada más: no cambia la cuota, ni
                        las categorías, ni ningún permiso. Las opciones son las
                        tres del DNI y no hay más — "otro" y "no especifica" son
                        parte de lo que la X cubre, y lo que el documento imprime
                        es una X. */}
                    <SelectField
                        control={form.control}
                        name="sex"
                        label="Sexo"
                        options={MEMBER_SEX_OPTIONS}
                        placeholder="Sin cargar"
                        description="Como figura en tu DNI."
                        disabled={frozen}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="+54 9 11 4567-8910"
                                        disabled={frozen}
                                        {...field}
                                    />
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
                                    <Input
                                        placeholder="Av. Belgrano 1234, Cutral Có"
                                        disabled={frozen}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    variant="hero"
                    className="w-fit"
                    disabled={frozen || isPending}
                >
                    {isPending && <Loader2 className="animate-spin" />}
                    {isPending ? 'Guardando…' : 'Guardar cambios'}
                </Button>
            </form>
        </Form>
    )
}
