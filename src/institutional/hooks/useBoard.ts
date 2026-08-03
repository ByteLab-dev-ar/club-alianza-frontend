import { useQuery } from '@tanstack/react-query'
import { QK } from '@/api/queryKeys'
import { getBoardAction } from '../actions/get-board.action'

export const useBoard = () => {
    return useQuery({
        queryKey: [QK.board],
        queryFn: getBoardAction,
        staleTime: 1000 * 60 * 30,
    })
}
