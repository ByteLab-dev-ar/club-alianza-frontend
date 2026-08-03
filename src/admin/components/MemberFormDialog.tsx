import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
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
    ...(values.dni ? { dni: values.dni } : {}),
    ...(values.phone ? { phone: values.phone } : {}),
    ...(values.address ? { address: values.address } : {}),
    ...(values.bornDate ? { bornDate: values.bornDate } : {}),
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
        dni: member?.dni ?? '',
        phone: member?.phone ?? '',
        address: member?.address ?? '',
        bornDate: member?.bornDate?.slice(0, 10) ?? '',
        memberNumber: member?.memberNumber ?? '',
        expirationDate: member?.expirationDate?.slice(0, 10) ?? '',
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
