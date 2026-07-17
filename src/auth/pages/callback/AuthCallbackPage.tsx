import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useAuthStore } from '@/auth/store/auth.store'
import { PageLoader } from '@/components/custom/PageLoader'
import { homeRouteForRoles } from '@/router/home-route'

/**
 * Aterrizaje del login con Google (el backend redirige acá vía
 * GOOGLE_SUCCESS_REDIRECT). Las cookies ya vienen seteadas, así que solo hay que
 * releer la sesión y mandar al usuario a su home según el rol.
 */
export const AuthCallbackPage = () => {
    const navigate = useNavigate()
    const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus)

    useEffect(() => {
        void checkAuthStatus().then((isAuthenticated) => {
            if (!isAuthenticated) {
                navigate('/ingresar', { replace: true })
                return
            }

            const { user } = useAuthStore.getState()
            navigate(homeRouteForRoles(user?.roles), { replace: true })
        })
    }, [checkAuthStatus, navigate])

    return <PageLoader />
}
