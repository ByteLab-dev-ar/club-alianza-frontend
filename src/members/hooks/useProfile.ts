import { useQuery } from '@tanstack/react-query'
import { getProfileAction } from '../actions/profile.actions'
import { getCredentialAction } from '../actions/get-credential.action'

export const PROFILE_QUERY_KEY = ['member-profile']

export const useProfile = () => {
    return useQuery({
        queryKey: PROFILE_QUERY_KEY,
        queryFn: getProfileAction,
        staleTime: 1000 * 60 * 5,
    })
}

export const useCredential = () => {
    return useQuery({
        queryKey: ['member-credential'],
        queryFn: getCredentialAction,
        staleTime: 1000 * 60 * 5,
    })
}
