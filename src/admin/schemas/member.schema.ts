import { z } from 'zod'
import {
    addressField,
    cuilField,
    dniField,
    personNameField,
    phoneField,
} from '@/shared/schemas/fields'
import { MemberSexes } from '@/members/interfaces/MemberProfile'

// Campos comunes a alta y edición. Los opcionales aceptan '' y se limpian antes
// de mandar (el backend rechaza strings vacíos con whitelist).
const baseMemberSchema = z.object({
    name: personNameField,
    surname: personNameField,
    // Identifica al socio (único entre vigentes). El dni va aparte y es solo un
    // dato de contacto: puede repetirse entre dos personas.
    cuil: cuilField,
    dni: dniField,
    phone: phoneField,
    address: addressField,
    bornDate: z.string().or(z.literal('')),
    // Las tres del DNI y no otras (Decreto 476/2021): el padrón tiene que decir
    // lo mismo que el documento que lo respalda. El '' es "todavía sin cargar",
    // que es como llega el socio del padrón histórico.
    sex: z.enum(MemberSexes).or(z.literal('')),
    memberNumber: z.string().max(20, 'Máximo 20 caracteres').or(z.literal('')),
    expirationDate: z.string().or(z.literal('')),
})

/** Alta: el email es obligatorio (con él se crea la cuenta). */
export const createMemberSchema = baseMemberSchema.extend({
    email: z.email('Ingresá un email válido'),
})

/** Lo que el socio puede editar de su propio perfil (ver ProfileForm). */
export const memberProfileSchema = baseMemberSchema.pick({
    name: true,
    surname: true,
    cuil: true,
    dni: true,
    phone: true,
    address: true,
    bornDate: true,
    sex: true,
})

export type CreateMemberSchema = z.infer<typeof createMemberSchema>
export type MemberProfileSchema = z.infer<typeof memberProfileSchema>
