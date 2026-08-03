import { useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getDashboardAction } from '../actions/get-dashboard.action'

export const useDashboard = () => {
    return useQuery({
        queryKey: [QK.adminDashboard],
        queryFn: getDashboardAction,
        staleTime: 1000 * 60,
    })
}
