import { z } from 'zod'

// Los límites replican los del ContactDto del backend, para no depender
// de un 400 para avisarle al usuario que se pasó de largo.
export const contactSchema = z.object({
    name: z.string().min(1, 'Ingresá tu nombre').max(80, 'Máximo 80 caracteres'),
    email: z.email('Ingresá un email válido'),
    subject: z.string().min(1, 'Ingresá un asunto').max(150, 'Máximo 150 caracteres'),
    message: z.string().min(1, 'Escribí tu mensaje').max(1000, 'Máximo 1000 caracteres'),
})

export type ContactSchema = z.infer<typeof contactSchema>
