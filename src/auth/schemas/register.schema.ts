import { z } from 'zod'
import { passwordField, personNameField } from '@/shared/schemas/fields'

/**
 * Espeja al RegisterUserDto del backend. La regla de contraseña sale de
 * shared/schemas/fields para que sea la misma en registro, reset y alta de
 * staff: mejor avisarlo mientras se escribe que devolver un 400 después.
 */
export const registerSchema = z
    .object({
        name: personNameField,
        surname: personNameField,
        email: z.email('Ingresá un email válido'),
        password: passwordField,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

export type RegisterSchema = z.infer<typeof registerSchema>
