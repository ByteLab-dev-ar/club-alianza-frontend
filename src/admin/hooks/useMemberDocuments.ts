import { useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getMemberDocumentsAction } from '../actions/members.actions'

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
