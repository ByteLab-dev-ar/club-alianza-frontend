import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import { SelectField } from '@/components/custom/SelectField'
import { formatCuil, normalizeCuil } from '@/shared/schemas/fields'
import { MEMBER_SEX_OPTIONS } from '@/members/interfaces/MemberProfile'
import { createMemberSchema, type CreateMemberSchema } from '../schemas/member.schema'
import { useCreateMember, useUpdateMember } from '../hooks/useMembers'
import type { AdminMember, UpdateMemberPayload } from '../interfaces/AdminMember'

interface Props {
    /** Presente = edición; ausente = alta. */
    member?: AdminMember
    trigger?: React.ReactNode
}

/**
 * Los opcionales vacíos no se mandan: el backend los rechaza con whitelist y no
 * tiene sentido "borrar" un dato mandando ''. Se arman campo por campo en vez de
 * filtrar un objeto genérico para que el tipo salga exacto, sin aserciones.
 */
const optionalFields = (values: CreateMemberSchema): UpdateMemberPayload => ({
    // Se manda normalizado (11 dígitos) y no como se tipeó: el backend también
    // normaliza, pero si mandáramos "20-12345678-6" el valor validado acá y el
    // guardado allá serían distintos, y los mensajes de error de unicidad
    // hablarían de un número que no es el que se ve en pantalla.
    ...(values.cuil ? { cuil: normalizeCuil(values.cuil) } : {}),
    ...(values.dni ? { dni: values.dni } : {}),
    ...(values.phone ? { phone: values.phone } : {}),
    ...(values.address ? { address: values.address } : {}),
    ...(values.bornDate ? { bornDate: values.bornDate } : {}),
    ...(values.sex ? { sex: values.sex } : {}),
    ...(values.memberNumber ? { memberNumber: values.memberNumber } : {}),
    ...(values.expirationDate ? { expirationDate: values.expirationDate } : {}),
})

export const MemberFormDialog = ({ member, trigger }: Props) => {
    const isEdit = !!member

    const createMutation = useCreateMember()
    const updateMutation = useUpdateMember(member?.id ?? '')

    const buildDefaults = (): CreateMemberSchema => ({
        email: member?.email ?? '',
        name: member?.name ?? '',
        surname: member?.surname ?? '',
        // Se muestra con guiones aunque la API lo devuelva en 11 dígitos secos:
        // así se puede comparar de un vistazo contra el papel que trae el socio.
        cuil: formatCuil(member?.cuil),
        dni: member?.dni ?? '',
        phone: member?.phone ?? '',
        address: member?.address ?? '',
        bornDate: member?.bornDate?.slice(0, 10) ?? '',
        // '' es "todavía sin cargar": así llegan los socios de la importación
        // del padrón histórico, que no traía el dato.
        sex: member?.sex ?? '',
        memberNumber: member?.memberNumber ?? '',
        // El campo del formulario sigue llamándose `expirationDate` porque así lo
        // recibe el PATCH del backend, pero lo que precarga es `membershipUntil`:
        // el alias viejo va a desaparecer de la respuesta, y son el mismo dato.
        // Acá se edita la membresía y nada más — la actividad y el seguro se
        // mueven pagando, no escribiendo una fecha a mano.
        expirationDate: member?.membershipUntil?.slice(0, 10) ?? '',
    })

    // En edición el email queda oculto y no se toca; el schema de alta sirve para
    // ambos modos porque el resto de los campos son iguales.
    const form = useForm<CreateMemberSchema>({
        resolver: zodResolver(createMemberSchema),
        defaultValues: buildDefaults(),
    })

    const onSubmit = (values: CreateMemberSchema) => {
        const { name, surname } = values

        return isEdit
            ? updateMutation.mutateAsync({ name, surname, ...optionalFields(values) })
            : createMutation.mutateAsync({
                  email: values.email,
                  name,
                  surname,
                  ...optionalFields(values),
              })
    }

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title={isEdit ? 'Editar socio' : 'Nuevo socio'}
            description={
                isEdit
                    ? 'Actualizá los datos del socio, incluido el número y el vencimiento.'
                    : 'Se crea la cuenta y se envía un mail de bienvenida para que configure su contraseña.'
            }
            trigger={trigger}
            triggerLabel="Nuevo socio"
            submitLabel={isEdit ? 'Guardar cambios' : 'Crear socio'}
            successMessage={
                isEdit ? 'Socio actualizado' : 'Socio creado. Le enviamos un mail de bienvenida.'
            }
            errorFallback="No pudimos guardar el socio"
            isPending={createMutation.isPending || updateMutation.isPending}
            contentClassName="max-h-[90vh] max-w-xl overflow-y-auto"
        >
            {!isEdit && (
                <TextField
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="socio@email.com"
                />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="name" label="Nombre" />
                <TextField control={form.control} name="surname" label="Apellido" />
            </div>

            {/* El CUIL va primero y solo: es el dato que identifica al socio
                (el DNI puede repetirse entre dos personas distintas). */}
            <TextField
                control={form.control}
                name="cuil"
                label="CUIL"
                inputMode="numeric"
                placeholder="20-12345678-6"
                description="Identifica al socio. Podés cargarlo con guiones o sin ellos."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    control={form.control}
                    name="dni"
                    label="DNI"
                    inputMode="numeric"
                    placeholder="38452119"
                />
                <TextField
                    control={form.control}
                    name="bornDate"
                    label="Fecha de nacimiento"
                    type="date"
                />
            </div>

            {/* Dato del padrón y nada más: no toca la cuota, ni las categorías,
                ni ningún permiso. Las opciones son las tres del DNI. */}
            <SelectField
                control={form.control}
                name="sex"
                label="Sexo"
                options={MEMBER_SEX_OPTIONS}
                placeholder="Sin cargar"
                description="Como figura en el DNI."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    control={form.control}
                    name="phone"
                    label="Teléfono"
                    placeholder="+54 9 11 ..."
                />
                <TextField control={form.control} name="address" label="Domicilio" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    control={form.control}
                    name="memberNumber"
                    label="N° de socio"
                    placeholder="00482"
                />
                <TextField
                    control={form.control}
                    name="expirationDate"
                    label="Vencimiento de cuota"
                    type="date"
                />
            </div>
        </FormDialog>
    )
}
