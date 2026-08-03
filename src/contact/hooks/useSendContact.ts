import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/api/clubApi'
import { sendContactAction } from '../actions/send-contact.action'

export const useSendContact = () => {
    return useMutation({
        mutationFn: sendContactAction,
        onSuccess: () => toast.success('Mensaje enviado. Te vamos a responder por email.'),
        onError: (error) => {
            // El endpoint tiene throttling (3 por minuto por IP): sin este caso,
            // el 429 saldría como un error genérico y la persona reintentaría en loop.
            if (error instanceof AxiosError && error.response?.status === 429) {
                toast.error('Enviaste demasiados mensajes seguidos. Esperá un minuto.')
                return
            }
            toast.error(getApiErrorMessage(error, 'No pudimos enviar tu mensaje'))
        },
    })
}
