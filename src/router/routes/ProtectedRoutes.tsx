import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuthStore } from '@/auth/store/auth.store'
import { hasRole, type Role } from '@/constants/roles'
import { PageLoader } from '@/components/custom/PageLoader'
import { homeRouteForRoles } from '../home-route'

/** Exige sesión activa. Recuerda a dónde iba para volver ahí después del login. */
export const AuthenticatedRoutes = ({ children }: PropsWithChildren) => {
    // Con selectores en vez de useAuthStore(): así estos componentes no se
    // re-renderizan por cualquier cambio del store, solo por lo que leen.
    const status = useAuthStore((state) => state.status)
    const location = useLocation()

    if (status === 'checking') return <PageLoader />
    if (status === 'not-authenticated') {
        return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />
    }

    return children
}

/** Solo para quien NO tiene sesión (login, registro): si ya entró, lo saca de acá. */
export const NotAuthenticatedRoutes = ({ children }: PropsWithChildren) => {
    const status = useAuthStore((state) => state.status)
    const user = useAuthStore((state) => state.user)

    if (status === 'checking') return <PageLoader />
    if (status === 'authenticated') {
        return <Navigate to={homeRouteForRoles(user?.roles)} replace />
    }

    return children
}

interface RoleRoutesProps extends PropsWithChildren {
    /** Basta con tener UNO de estos roles (roles es un array en el backend). */
    allowed: readonly Role[]
}

/** Exige sesión + al menos uno de los roles indicados. */
export const RoleRoutes = ({ allowed, children }: RoleRoutesProps) => {
    const status = useAuthStore((state) => state.status)
    const user = useAuthStore((state) => state.user)
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
