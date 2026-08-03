import { z } from 'zod'
import { Roles } from '@/constants/roles'
import { passwordField, personNameField } from '@/shared/schemas/fields'

const staffRole = z.enum([Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN, Roles.RECEPTION])

const baseStaff = z.object({
    name: personNameField,
    surname: personNameField,
    email: z.email('Ingresá un email válido'),
    roles: z.array(staffRole).min(1, 'Elegí al menos un rol'),
})

/** Alta directa: incluye la contraseña, con las mismas reglas que el backend. */
export const createStaffSchema = baseStaff.extend({
    password: passwordField,
})

/** Invitación: sin contraseña (la define la persona desde el mail). */
export const inviteStaffSchema = baseStaff

/**
 * Variante de invitación para el form compartido de StaffFormDialog: mismo
 * shape que el de alta (el campo password existe en los defaultValues) pero
 * sin validarla, porque en modo invitación no se renderiza y viaja vacía
 * hasta que onSubmit la descarta.
 */
export const inviteStaffFormSchema = baseStaff.extend({
    password: z.string(),
})

export type CreateStaffSchema = z.infer<typeof createStaffSchema>
export type InviteStaffSchema = z.infer<typeof inviteStaffSchema>
