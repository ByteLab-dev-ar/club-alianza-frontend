import { useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getEventCategoriesAction } from '../actions/get-event-categories.action'

export const useEventCategories = () => {
    return useQuery({
        queryKey: [QK.eventCategories],
        queryFn: getEventCategoriesAction,
        staleTime: 1000 * 60 * 30,
    })
}
