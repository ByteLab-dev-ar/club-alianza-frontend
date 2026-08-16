import {
    CalendarDays,
    HandCoins,
    Images,
    Inbox,
    LayoutDashboard,
    Receipt,
    ScanLine,
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
    // Aparte del padrón a propósito: son los que todavía NO son socios, y
    // aprobar es decidir quién entra. Sin tesorería.
    { to: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox, allowed: [Roles.ADMIN] },
    { to: '/admin/pagos', label: 'Pagos', icon: Receipt, allowed: [Roles.ADMIN, Roles.ACCOUNTANT] },
    // Los montos los configuran ADMIN y tesorería: sin esto el club depende de
    // un desarrollador para cada aumento.
    { to: '/admin/montos', label: 'Montos', icon: HandCoins, allowed: [Roles.ADMIN, Roles.ACCOUNTANT] },
    // Los grupos, en cambio, solo ADMIN: armar una familia es lo que decide
    // quién paga la actividad a mitad de precio, y eso es una decisión de
    // membresía, no de mostrador.
    { to: '/admin/grupos-familiares', label: 'Grupos familiares', icon: Users, allowed: [Roles.ADMIN] },
    { to: '/admin/eventos', label: 'Eventos', icon: CalendarDays, allowed: [Roles.ADMIN, Roles.WEB_ADMIN] },
    { to: '/admin/galeria', label: 'Galería', icon: Images, allowed: [Roles.ADMIN, Roles.WEB_ADMIN] },
    { to: '/admin/institucional', label: 'Institucional', icon: Landmark, allowed: [Roles.ADMIN, Roles.WEB_ADMIN] },
    { to: '/admin/staff', label: 'Administradores', icon: ShieldCheck, allowed: [Roles.ADMIN] },
    { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText, allowed: [Roles.ADMIN] },
    // Sale del panel: el escáner de puerta es una pantalla propia, sin sidebar.
    // Va acá igual para que el admin —que puede escanear— tenga cómo llegar
    // sin tipear la URL.
    { to: '/puerta', label: 'Escanear credencial', icon: ScanLine, allowed: [Roles.ADMIN] },
]
