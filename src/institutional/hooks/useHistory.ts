import { useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getHistoryAction } from '../actions/get-history.action'

export const useHistory = () => {
    return useQuery({
        queryKey: [QK.history],
        queryFn: getHistoryAction,
        staleTime: 1000 * 60 * 30,
    })
}
