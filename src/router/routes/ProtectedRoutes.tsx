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

/**
 * Exige ser SOCIO del club, no solo tener cuenta.
 *
 * Son cosas distintas: el personal invitado tiene cuenta y perfil, pero no cuota
 * ni credencial, y `GET /members/credential` y `GET /payments/next-due` le
 * responden 403. Sin este guard esas pantallas cargaban igual y mostraban un
 * "probá recargar en unos minutos" que sugiere una falla pasajera, cuando en
 * realidad nunca van a funcionar para esa cuenta.
 *
 * Filtrar el sidebar no alcanza: el footer público linkea a /mi-cuenta/credencial
 * y /mi-cuenta/pagos, y el historial del navegador también llega ahí.
 *
 * Ojo, no restringe a las cuentas híbridas: alguien que es socio Y recepción
 * tiene `isMember: true` y ve todo, como antes.
 *
 * El redirect va a la afiliación y no al perfil desde que existe §1: el que no
 * es socio está a mitad de un trámite, y esa es la pantalla que se lo dice y se
 * lo deja terminar. Mandarlo a "Mi perfil" le mostraba un formulario sin
 * explicarle para qué lo estaba llenando.
 */
export const MemberRoutes = ({ children }: PropsWithChildren) => {
    const status = useAuthStore((state) => state.status)
    // Selector sobre el campo y no el helper `is(...)`: ese devuelve una función
    // estable, así que el componente no se re-renderizaría al cambiar `user`.
    const isMember = useAuthStore((state) => state.user?.isMember ?? false)
    const location = useLocation()

    if (status === 'checking') return <PageLoader />
    if (status === 'not-authenticated') {
        return <Navigate to="/ingresar" state={{ from: location.pathname }} replace />
    }

    // A "Mi afiliación", que es lo que sí le sirve: dónde está su trámite y qué
    // le falta. Está fuera de este guard justamente para que no entre en loop.
    if (!isMember) return <Navigate to="/mi-cuenta/afiliacion" replace />

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
