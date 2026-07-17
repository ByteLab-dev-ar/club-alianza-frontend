import { z } from 'zod'

/**
 * Espeja al RegisterUserDto del backend. La regla de contraseña es la misma que
 * valida allá (mayúscula, minúscula, número y carácter especial): mejor avisarlo
 * mientras se escribe que devolver un 400 después de enviar.
 */
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Mínimo 2 caracteres')
            .max(25, 'Máximo 25 caracteres'),
        surname: z
            .string()
            .min(2, 'Mínimo 2 caracteres')
            .max(25, 'Máximo 25 caracteres'),
        email: z.email('Ingresá un email válido'),
        password: z
            .string()
            .min(6, 'Mínimo 6 caracteres')
            .max(20, 'Máximo 20 caracteres')
            .regex(/(?=.*[a-z])/, 'Debe tener al menos una minúscula')
            .regex(/(?=.*[A-Z])/, 'Debe tener al menos una mayúscula')
            .regex(/(?=.*\d)/, 'Debe tener al menos un número')
            .regex(/(?=.*[\W_])/, 'Debe tener al menos un carácter especial'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type RegisterSchema = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
    email: z.email('Ingresá un email válido'),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, 'Mínimo 6 caracteres')
            .max(20, 'Máximo 20 caracteres')
            .regex(/(?=.*[a-z])/, 'Debe tener al menos una minúscula')
            .regex(/(?=.*[A-Z])/, 'Debe tener al menos una mayúscula')
            .regex(/(?=.*\d)/, 'Debe tener al menos un número')
            .regex(/(?=.*[\W_])/, 'Debe tener al menos un carácter especial'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
