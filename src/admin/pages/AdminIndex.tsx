import { Navigate } from 'react-router'

import { useAuthStore } from '@/auth/store/auth.store'
import { Roles } from '@/constants/roles'
import { ADMIN_NAV } from '../config/nav'
import { DashboardPage } from './DashboardPage'

/**
 * Landing de /admin. El dashboard es solo para ADMIN y ACCOUNTANT; un WEB_ADMIN
 * (que entra al panel pero no ve números) cae en la primera sección que sí puede
 * ver, evitando el loop de redirigirlo a un /admin que no tiene permiso de mirar.
 */
export const AdminIndex = () => {
    const { is } = useAuthStore()

    if (is(Roles.ADMIN, Roles.ACCOUNTANT)) {
        return <DashboardPage />
    }

    const firstAllowed = ADMIN_NAV.find((item) => item.to !== '/admin' && is(...item.allowed))
    return <Navigate to={firstAllowed?.to ?? '/'} replace />
}
