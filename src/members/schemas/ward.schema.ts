import { z } from 'zod'

import {
    addressField,
    cuilField,
    dniField,
    personNameField,
    phoneField,
} from '@/shared/schemas/fields'
import { MemberSexes } from '../interfaces/MemberProfile'

/**
 * El alta de un menor a cargo (§2.2).
 *
 * Solo tres campos son obligatorios, y la fecha de nacimiento es el que
 * sorprende: de ella salen la categoría si el chico juega y si corresponde
 * afiliarlo como tutelado. El resto se puede completar después, igual que en la
 * ficha propia — lo que no se puede es presentar la solicitud sin todo cargado.
 */
export const createWardSchema = z.object({
    name: personNameField,
    surname: personNameField,
    bornDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
    cuil: cuilField,
    dni: dniField,
    sex: z.enum(MemberSexes).or(z.literal('')),
    phone: phoneField,
    address: addressField,
    isPlayer: z.boolean(),
    /**
     * No es un campo más del formulario: es el momento en que el adulto asume la
     * obligación de la cuota del chico. Por eso se valida como un requisito
     * propio y con su mensaje, en vez de dejar que el 400 del backend explique
     * algo que la pantalla ya tenía que haber dicho.
     */
    acceptsPaymentResponsibility: z
        .boolean()
        .refine((accepted) => accepted, 'Tenés que aceptar hacerte cargo de su cuota'),
})

export type CreateWardSchema = z.infer<typeof createWardSchema>
