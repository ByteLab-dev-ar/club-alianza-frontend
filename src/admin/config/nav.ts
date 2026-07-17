import {
    CalendarDays,
    Images,
    LayoutDashboard,
    Receipt,
    ScrollText,
    ShieldCheck,
    Users,
    Landmark,
    type LucideIcon,
} from 'lucide-react'

import { Roles, type Role } from '@/constants/roles'

export interface AdminNavItem {
    to: string
    label: string
    icon: LucideIcon
    /** Basta con tener uno de estos roles para ver la sección. */
    allowed: Role[]
    /** `end` para que el índice no quede activo en las subrutas. */
    end?: boolean
}

/**
 * Fuente única de las secciones del admin: la usa el sidebar (qué mostrar) y el
 * router (qué proteger), así nunca se desincronizan permiso visual y permiso real.
 */
export const ADMIN_NAV: AdminNavItem[] = [
    { to: '/admin', label: 'Resumen', icon: LayoutDashboard, allowed: [Roles.ADMIN, Roles.ACCOUNTANT], end: true },
    { to: '/admin/socios', label: 'Socios', icon: Users, allowed: [Roles.ADMIN] },
    { to: '/admin/pagos', label: 'Pagos', icon: Receipt, allowed: [Roles.ADMIN, Roles.ACCOUNTANT] },
    { to: '/admin/eventos', label: 'Eventos', icon: CalendarDays, allowed: [Roles.ADMIN, Roles.WEB_ADMIN] },
    { to: '/admin/galeria', label: 'Galería', icon: Images, allowed: [Roles.ADMIN, Roles.WEB_ADMIN] },
    { to: '/admin/institucional', label: 'Institucional', icon: Landmark, allowed: [Roles.ADMIN, Roles.WEB_ADMIN] },
    { to: '/admin/staff', label: 'Administradores', icon: ShieldCheck, allowed: [Roles.ADMIN] },
    { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText, allowed: [Roles.ADMIN] },
]
