import {
    CreditCard,
    FileCheck2,
    LayoutDashboard,
    Receipt,
    UserCog,
    type LucideIcon,
} from 'lucide-react'

export interface MemberNavItem {
    to: string
    label: string
    icon: LucideIcon
    /**
     * La sección solo existe para socios del club (`isMember`). No es lo mismo
     * que tener cuenta: el personal invitado tiene perfil —ahí viven su nombre y
     * apellido— pero no cuota ni credencial, y el backend le responde 403.
     */
    memberOnly?: boolean
    /** `end` para que el índice no quede activo en las subrutas. */
    end?: boolean
}

/**
 * Fuente única de las secciones del portal del socio: la usa el sidebar (qué
 * mostrar) y el router (qué proteger), con el mismo criterio que ADMIN_NAV, así
 * no se desincronizan permiso visual y permiso real.
 *
 * "Mi afiliación" y "Mi perfil" quedan SIN `memberOnly` a propósito, y por dos
 * razones distintas:
 *
 * - La afiliación es justamente la pantalla del que TODAVÍA no es socio (§1.3).
 *   Gatearla por `isMember` la escondería de su único destinatario. Es también
 *   el destino al que cae quien entra por un deep link a una sección que no le
 *   corresponde, así que no puede estar gateada.
 * - `GET/PATCH /members/profile` no chequea `isMember`, así que el perfil es
 *   donde el personal no socio edita sus datos y pide el cambio de correo.
 */
export const MEMBER_NAV: MemberNavItem[] = [
    { to: '/mi-cuenta', label: 'Resumen', icon: LayoutDashboard, memberOnly: true, end: true },
    { to: '/mi-cuenta/credencial', label: 'Credencial', icon: CreditCard, memberOnly: true },
    { to: '/mi-cuenta/pagos', label: 'Pagos', icon: Receipt, memberOnly: true },
    { to: '/mi-cuenta/afiliacion', label: 'Mi afiliación', icon: FileCheck2 },
    { to: '/mi-cuenta/perfil', label: 'Mi perfil', icon: UserCog },
]
