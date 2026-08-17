import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import { SelectField } from '@/components/custom/SelectField'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { normalizeCuil } from '@/shared/schemas/fields'
import { MEMBER_SEX_OPTIONS } from '../interfaces/MemberProfile'
import { createWardSchema, type CreateWardSchema } from '../schemas/ward.schema'
import { useCreateWard } from '../hooks/useWards'

const EMPTY: CreateWardSchema = {
    name: '',
    surname: '',
    bornDate: '',
    cuil: '',
    dni: '',
    sex: '',
    phone: '',
    address: '',
    isPlayer: false,
    acceptsPaymentResponsibility: false,
}

/**
 * Cargar un menor a cargo (§2.2).
 *
 * Dos cosas de esta pantalla no son detalles de forma:
 *
 * - **La aceptación de la cuota va con el texto a la vista**, no como letra
 *   chica ni como una casilla marcada por defecto. Es el momento en que el
 *   adulto asume una obligación de plata, y un menor se obliga a través de su
 *   representante: quien contrae la deuda es él.
 * - **Se pregunta si el chico va a jugar**, porque de ahí sale su categoría. Es
 *   una de las dos excepciones a "solo el club marca jugador", y se permite
 *   porque es una carga sobre otra persona, no una auto-asignación.
 */
export const CreateWardDialog = ({ trigger }: { trigger?: ReactNode }) => {
    const { mutateAsync, isPending } = useCreateWard()

    const form = useForm<CreateWardSchema>({
        resolver: zodResolver(createWardSchema),
        defaultValues: EMPTY,
    })

    const onSubmit = (values: CreateWardSchema) =>
        mutateAsync({
            name: values.name,
            surname: values.surname,
            bornDate: values.bornDate,
            isPlayer: values.isPlayer,
            acceptsPaymentResponsibility: values.acceptsPaymentResponsibility,
            // Los opcionales vacíos no se mandan: el backend rechaza strings
            // vacíos con whitelist.
            ...(values.cuil ? { cuil: normalizeCuil(values.cuil) } : {}),
            ...(values.dni ? { dni: values.dni } : {}),
            ...(values.sex ? { sex: values.sex } : {}),
            ...(values.phone ? { phone: values.phone } : {}),
            ...(values.address ? { address: values.address } : {}),
        })

    return (
        <FormDialog
            form={form}
            buildDefaults={() => EMPTY}
            onSubmit={onSubmit}
            title="Asociar a un chico"
            description="Va a ser socio del club como cualquier otro: con su ficha, su número y su credencial. Lo único distinto es que vos hacés el trámite y pagás su cuota."
            trigger={trigger}
            triggerLabel="Asociar a un chico"
            submitLabel="Cargar"
            successMessage="Menor cargado"
            errorFallback="No pudimos cargar al menor"
            isPending={isPending}
            contentClassName="max-h-[90vh] max-w-xl overflow-y-auto"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="name" label="Nombre" />
                <TextField control={form.control} name="surname" label="Apellido" />
            </div>

            {/* Cuatro filas de dos columnas parejas, y los campos con aclaración
                emparejados entre sí: una fila donde solo un lado lleva texto de
                ayuda se lee como un formulario desalineado. */}
            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    control={form.control}
                    name="bornDate"
                    label="Fecha de nacimiento"
                    type="date"
                    description="Obligatoria: de acá sale su categoría si juega."
                />
                <SelectField
                    control={form.control}
                    name="sex"
                    label="Sexo"
                    options={MEMBER_SEX_OPTIONS}
                    placeholder="Sin cargar"
                    description="Como figura en su DNI."
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                    control={form.control}
                    name="cuil"
                    label="CUIL"
                    inputMode="numeric"
                    placeholder="20-12345678-6"
                />
                <TextField
                    control={form.control}
                    name="dni"
                    label="DNI"
                    inputMode="numeric"
                    placeholder="38452119"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="phone" label="Teléfono" />
                <TextField control={form.control} name="address" label="Domicilio" />
            </div>

            {/* De la respuesta a esto sale su categoría (§3.2). No se le pregunta
                al chico ni se deduce de la edad: lo indica el tutor al
                afiliarlo. */}
            <FormField
                control={form.control}
                name="isPlayer"
                render={({ field }) => (
                    <FormItem>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                            <FormControl>
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(event) => field.onChange(event.target.checked)}
                                    className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                                />
                            </FormControl>
                            <span>
                                <span className="block text-sm font-semibold text-ink">
                                    Va a jugar en el club
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                    Si juega, además de la membresía paga la actividad, y el
                                    club le asigna su categoría según la edad que cumple este
                                    año. Se puede sacar después.
                                </span>
                            </span>
                        </label>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/*
             * §2.2: "El tutor acepta, ahí mismo, que queda responsable de la
             * cuota de ese chico. No es letra chica: es el momento en que asume
             * la obligación, y tiene que ser una aceptación explícita en
             * pantalla."
             */}
            <FormField
                control={form.control}
                name="acceptsPaymentResponsibility"
                render={({ field }) => (
                    <FormItem>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-secondary/40 bg-accent/40 p-4">
                            <FormControl>
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(event) => field.onChange(event.target.checked)}
                                    className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                                />
                            </FormControl>
                            <span>
                                <span className="block text-sm font-semibold text-ink">
                                    Me hago cargo de su cuota
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                    Entiendo que el club me va a reclamar a mí la cuota de este
                                    chico: la membresía y, si juega, la actividad. Él es socio
                                    igual que cualquier otro, pero la paga su tutor.
                                </span>
                            </span>
                        </label>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormDialog>
    )
}
