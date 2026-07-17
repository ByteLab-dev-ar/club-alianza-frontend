import { useQuery } from '@tanstack/react-query'
import { getEventCategoriesAction } from '../actions/get-event-categories.action'

export const useEventCategories = () => {
    return useQuery({
        queryKey: ['event-categories'],
        queryFn: getEventCategoriesAction,
        staleTime: 1000 * 60 * 30,
    })
}
