import { clubApi } from '@/api/clubApi'
import type { ContactSchema } from '../schemas/contact.schema'

/**
 * POST /contact — público. El backend reenvía el mensaje por mail a la directiva
 * (no lo persiste) y tiene throttling de 3 por minuto por IP.
 */
export const sendContactAction = async (payload: ContactSchema) => {
    await clubApi.post('/contact', payload)
}
