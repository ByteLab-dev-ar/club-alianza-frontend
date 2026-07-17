import { useQuery } from '@tanstack/react-query'
import { getMemberDocumentsAction } from '../actions/members.actions'

/**
 * Las URLs firmadas duran 5 minutos, así que no tiene sentido cachearlas mucho:
 * se piden solo cuando se abre el visor (`enabled`) y se consideran viejas rápido.
 */
export const useMemberDocuments = (memberId: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['admin-member-documents', memberId],
        queryFn: () => getMemberDocumentsAction(memberId),
        enabled,
        staleTime: 1000 * 60 * 4,
        gcTime: 1000 * 60 * 4,
    })
}
