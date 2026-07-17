import { useQuery } from '@tanstack/react-query'
import { getBoardAction } from '../actions/get-board.action'

export const useBoard = () => {
    return useQuery({
        queryKey: ['board'],
        queryFn: getBoardAction,
        staleTime: 1000 * 60 * 30,
    })
}
