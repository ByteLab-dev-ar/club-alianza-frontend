import { z } from 'zod'

// Campos comunes a alta y edición. Los opcionales aceptan '' y se limpian antes
// de mandar (el backend rechaza strings vacíos con whitelist).
const baseMemberSchema = z.object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(25, 'Máximo 25 caracteres'),
    surname: z.string().min(2, 'Mínimo 2 caracteres').max(25, 'Máximo 25 caracteres'),
    dni: z
        .string()
        .regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números')
        .or(z.literal('')),
    phone: z.string().max(30).or(z.literal('')),
    address: z.string().max(120).or(z.literal('')),
    bornDate: z.string().or(z.literal('')),
    memberNumber: z.string().max(20).or(z.literal('')),
    expirationDate: z.string().or(z.literal('')),
})

/** Alta: el email es obligatorio (con él se crea la cuenta). */
export const createMemberSchema = baseMemberSchema.extend({
    email: z.email('Ingresá un email válido'),
})

/** Edición: el email no se toca desde acá (el socio lo cambia con confirmación). */
export const editMemberSchema = baseMemberSchema

export type CreateMemberSchema = z.infer<typeof createMemberSchema>
export type EditMemberSchema = z.infer<typeof editMemberSchema>
