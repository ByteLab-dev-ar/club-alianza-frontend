import { useQuery } from '@tanstack/react-query'
import { getHistoryAction } from '../actions/get-history.action'

export const useHistory = () => {
    return useQuery({
        queryKey: ['history'],
        queryFn: getHistoryAction,
        staleTime: 1000 * 60 * 30,
    })
}
