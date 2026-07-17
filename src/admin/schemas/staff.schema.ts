import { z } from 'zod'
import { Roles } from '@/constants/roles'

const staffRole = z.enum([Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN])

const baseStaff = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(25, 'Máximo 25 caracteres'),
    surname: z.string().min(2, 'Mínimo 2 caracteres').max(25, 'Máximo 25 caracteres'),
    email: z.email('Ingresá un email válido'),
    roles: z.array(staffRole).min(1, 'Elegí al menos un rol'),
})

/** Alta directa: incluye la contraseña, con las mismas reglas que el backend. */
export const createStaffSchema = baseStaff.extend({
    password: z
        .string()
        .min(6, 'Mínimo 6 caracteres')
        .max(20, 'Máximo 20 caracteres')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).+$/,
            'Debe tener mayúscula, minúscula, número y símbolo',
        ),
})

/** Invitación: sin contraseña (la define la persona desde el mail). */
export const inviteStaffSchema = baseStaff

export type CreateStaffSchema = z.infer<typeof createStaffSchema>
export type InviteStaffSchema = z.infer<typeof inviteStaffSchema>
