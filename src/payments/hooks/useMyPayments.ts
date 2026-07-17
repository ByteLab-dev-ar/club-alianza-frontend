import { useQuery } from '@tanstack/react-query'
import { getMyPaymentsAction } from '../actions/payments.actions'

export const MY_PAYMENTS_QUERY_KEY = ['my-payments']

export const useMyPayments = () => {
    return useQuery({
        queryKey: MY_PAYMENTS_QUERY_KEY,
        queryFn: getMyPaymentsAction,
        staleTime: 1000 * 60,
    })
}
