import { z } from 'zod'
import { passwordField } from '@/shared/schemas/fields'

/**
 * Schemas de recuperación de contraseña. Estaban dentro de register.schema.ts,
 * donde no los encontraba quien buscara por nombre de archivo.
 */

export const forgotPasswordSchema = z.object({
    email: z.email('Ingresá un email válido'),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        newPassword: passwordField,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
