import { useQuery } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getUndeliverableAction } from '@/notifications/actions/notifications.actions'

/**
 * Con quién no se puede comunicar el club. **Solo ADMIN.**
 *
 * Cache largo a propósito: la lista se mueve cuando corre un barrido de avisos o
 * cuando el proveedor informa un rebote, no mientras alguien la mira. Es una
 * pantalla para sentarse a trabajarla, no un tablero en vivo.
 */
export const useUndeliverable = () => {
    return useQuery({
        queryKey: [QK.adminUndeliverable],
        queryFn: getUndeliverableAction,
        staleTime: 1000 * 60 * 5,
    })
}
