import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuthStore } from '@/auth/store/auth.store'
import { hasRole, type Role } from '@/constants/roles'
import { PageLoader } from '@/components/custom/PageLoader'
import { homeRouteForRoles } from '../home-route'

/** Exige sesión activa. Recuerda a dónde iba para volver ahí después del login. */
export const AuthenticatedRoutes = ({ children }: PropsWithChildren) => {
    const { status } = useAuthStore()
    const location = useLocation()

    if (status === 'checking') return <PageLoader />
    if (status === 'not-authenticated') {
        return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />
    }

    return children
}

/** Solo para quien NO tiene sesión (login, registro): si ya entró, lo saca de acá. */
export const NotAuthenticatedRoutes = ({ children }: PropsWithChildren) => {
    const { status, user } = useAuthStore()

    if (status === 'checking') return <PageLoader />
    if (status === 'authenticated') {
        return <Navigate to={homeRouteForRoles(user?.roles)} replace />
    }

    return children
}

interface RoleRoutesProps extends PropsWithChildren {
    /** Basta con tener UNO de estos roles (roles es un array en el backend). */
    allowed: Role[]
}

/** Exige sesión + al menos uno de los roles indicados. */
export const RoleRoutes = ({ allowed, children }: RoleRoutesProps) => {
    const { status, user } = useAuthStore()
    const location = useLocation()

    if (status === 'checking') return <PageLoader />
    if (status === 'not-authenticated') {
        return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />
    }

    if (!hasRole(user?.roles, ...allowed)) {
        // Tiene sesión pero no el rol: lo mandamos a su propio home, no al login.
        return <Navigate to={homeRouteForRoles(user?.roles)} replace />
    }

    return children
}
