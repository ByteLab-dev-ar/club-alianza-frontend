import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    getMemberDocumentsAction,
    uploadSignedAffiliationFormAction,
} from '../actions/members.actions'

/**
 * Documentos de identidad del socio. Se piden solo al abrir el visor (`enabled`).
 *
 * Antes tenían `staleTime`/`gcTime` de 4 minutos para que la entrada cacheada
 * muriera antes que la URL firmada que traía, que vencía a los 5. Eso ya no
 * aplica: el backend sirve los archivos por endpoints propios y la URL no vence,
 * solo exige sesión. Quedan los defaults.
 */
export const useMemberDocuments = (memberId: string, enabled: boolean) => {
    return useQuery({
        queryKey: [QK.adminMemberDocuments, memberId],
        queryFn: () => getMemberDocumentsAction(memberId),
        enabled,
    })
}

/**
 * Cargar la ficha de afiliación que el socio firmó en papel.
 *
 * Invalida SOLO los documentos de este socio: la ficha no toca ninguna
 * cobertura, ni el estado de la cuenta, ni ningún contador del dashboard. El
 * padrón muestra exactamente lo mismo antes y después.
 *
 * El toast repite lo que la letra chica del botón ya dice, porque es lo que hay
 * que hacer con el papel que quedó sobre el mostrador: se lo queda el club.
 */
export const useUploadSignedAffiliationForm = (memberId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (file: File) => uploadSignedAffiliationFormAction(memberId, file),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: [QK.adminMemberDocuments, memberId],
            })
            notify.success('Ficha firmada cargada. El papel se archiva en la sede.')
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos cargar la ficha')),
    })
}
