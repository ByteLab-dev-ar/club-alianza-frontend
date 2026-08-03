import { hasRole, Roles, type Role } from '@/constants/roles'

/**
 * A dónde mandar a alguien recién logueado.
 * Tesorería y los admins arrancan en el panel; el socio, en su cuenta.
 * (Un usuario puede tener varios roles: gana el de mayor alcance.)
 */
export const homeRouteForRoles = (roles: Role[] | undefined): string => {
    if (hasRole(roles, Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN)) return '/admin'

    // Recepción va antes que el portal de socio: es lo ÚNICO que puede hacer.
    // Mandarlo a /admin o a /mi-cuenta lo dejaba rebotando entre guards.
    if (hasRole(roles, Roles.RECEPTION)) return '/puerta'

    return '/mi-cuenta'
}
