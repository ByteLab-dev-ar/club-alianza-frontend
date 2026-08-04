import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import { cn } from '@/lib/utils'
import {
    createStaffSchema,
    inviteStaffFormSchema,
    type CreateStaffSchema,
} from '../schemas/staff.schema'
import { useCreateStaff, useInviteStaff } from '../hooks/useStaff'
import { RoleCheckboxes } from './RoleCheckboxes'

type Mode = 'invite' | 'create'

const buildDefaults = (): CreateStaffSchema => ({
    name: '',
    surname: '',
    email: '',
    password: '',
    roles: [],
    isAlsoMember: false,
})

/**
 * Un 409 por email en uso no es un error de carga: significa que esa persona ya
 * tiene cuenta (típicamente un socio al que se lo nombra para un cargo). El
 * camino correcto es asignarle roles, no invitarla de nuevo, así que se detecta
 * para poder decirlo en vez de dejar el mensaje crudo del backend.
 */
const isEmailTakenError = (error: unknown): boolean =>
    axios.isAxiosError(error) && error.response?.status === 409

interface Props {
    /** Se llama al detectar un email ya registrado, para ofrecer el otro flujo. */
    onEmailTaken?: (email: string) => void
}

export const StaffFormDialog = ({ onEmailTaken }: Props) => {
    const [mode, setMode] = useState<Mode>('invite')

    const createMutation = useCreateStaff()
    const inviteMutation = useInviteStaff()

    // Un solo form para los dos tabs, pero el schema acompaña al modo: el de alta
    // exige contraseña; el de invitación no la valida (el campo ni se renderiza y
    // viaja vacío hasta que onSubmit lo descarta). Validar siempre con el de alta
    // dejaba la invitación fallando en silencio.
    const form = useForm<CreateStaffSchema>({
        resolver: zodResolver(mode === 'create' ? createStaffSchema : inviteStaffFormSchema),
        defaultValues: buildDefaults(),
    })

    // useWatch en vez de form.watch: mismo resultado, pero es la API que el
    // compilador de React puede memoizar (watch devuelve funciones inestables
    // y era la única advertencia que quedaba en el lint).
    const selectedRoles = useWatch({ control: form.control, name: 'roles' })
    const isAlsoMember = useWatch({ control: form.control, name: 'isAlsoMember' })

    const onSubmit = async (values: CreateStaffSchema) => {
        if (mode === 'create') {
            // El alta directa no puede crear socios: el backend fuerza
            // isMember:false, así que ni se manda el campo.
            const { isAlsoMember: _ignored, ...payload } = values
            void _ignored
            return createMutation.mutateAsync(payload)
        }

        const { password: _password, ...invite } = values
        void _password
        try {
            return await inviteMutation.mutateAsync(invite)
        } catch (error) {
            if (isEmailTakenError(error)) onEmailTaken?.(values.email)
            throw error
        }
    }

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title="Nuevo administrador"
            description="Sumá personal al panel. Podés invitarlo por mail (define su propia contraseña) o crearlo con una contraseña que definas vos."
            triggerLabel="Nuevo administrador"
            submitLabel={mode === 'create' ? 'Crear administrador' : 'Enviar invitación'}
            successMessage={
                mode === 'create' ? 'Administrador creado' : 'Invitación enviada por email'
            }
            errorFallback="No pudimos completar la operación"
            isPending={createMutation.isPending || inviteMutation.isPending}
            contentClassName="max-w-lg"
        >
            <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
                <TabsList className="w-full">
                    <TabsTrigger value="invite">Invitar por email</TabsTrigger>
                    <TabsTrigger value="create">Crear con contraseña</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="name" label="Nombre" />
                <TextField control={form.control} name="surname" label="Apellido" />
            </div>

            <TextField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="staff@clubalianza.com.ar"
            />

            {mode === 'create' && (
                <TextField
                    control={form.control}
                    name="password"
                    label="Contraseña"
                    placeholder="Mín. 6, con minúscula, mayúscula, número y símbolo"
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
                            onChange={(roles) => form.setValue('roles', roles, { shouldValidate: true })}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Solo en invitación: el alta directa no puede dar de alta socios. */}
            {mode === 'invite' && (
                <label
                    className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                        isAlsoMember ? 'border-secondary bg-accent' : 'border-border',
                    )}
                >
                    <input
                        type="checkbox"
                        checked={isAlsoMember}
                        onChange={(event) => form.setValue('isAlsoMember', event.target.checked)}
                        className="mt-0.5 size-4 shrink-0 accent-secondary"
                    />
                    <span>
                        <span className="block text-sm font-semibold text-ink">
                            También es socio del club
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                            Marcalo solo si esta persona es socia del club. Podés completar sus
                            datos de socio después, desde Socios.
                        </span>
                    </span>
                </label>
            )}
        </FormDialog>
    )
}
