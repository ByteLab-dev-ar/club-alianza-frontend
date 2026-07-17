import { useQuery } from '@tanstack/react-query'
import { getDashboardAction } from '../actions/get-dashboard.action'

export const useDashboard = () => {
    return useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: getDashboardAction,
        staleTime: 1000 * 60,
    })
}
