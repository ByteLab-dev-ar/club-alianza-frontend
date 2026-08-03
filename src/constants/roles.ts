/** Roles del backend (`user.roles` es un array: un usuario puede tener varios). */
export const Roles = {
    USER: 'user',
    ADMIN: 'admin',
    ACCOUNTANT: 'accountant',
    WEB_ADMIN: 'web_admin',
    /**
     * Personal de puerta. Lo ÚNICO que puede hacer es escanear credenciales:
     * no entra al panel, no ve pagos ni socios. Existe para no tener que darle
     * una cuenta de tesorería a quien controla la entrada.
     */
    RECEPTION: 'reception',
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

export const ROLE_LABELS: Record<Role, string> = {
    user: 'Socio',
    admin: 'Administrador',
    accountant: 'Tesorería',
    web_admin: 'Admin web',
    reception: 'Recepción',
}

/**
 * Roles con acceso al panel /admin (cada sección adentro filtra por rol).
 * `reception` queda afuera a propósito: no tiene ninguna sección que mirar.
 */
export const STAFF_ROLES = [Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN] as const

/** Quién puede validar credenciales en la puerta. */
export const DOOR_ROLES = [Roles.ADMIN, Roles.RECEPTION] as const

/**
 * Los roles que un admin puede otorgar desde la pantalla de personal.
 *
 * Es un conjunto distinto de STAFF_ROLES: `reception` se asigna igual que los
 * demás, pero no entra al panel. Mezclarlos dejaba a recepción sin forma de ser
 * invitada, o le abría secciones que no puede usar.
 */
export const ASSIGNABLE_ROLES = [
    Roles.ADMIN,
    Roles.ACCOUNTANT,
    Roles.WEB_ADMIN,
    Roles.RECEPTION,
] as const

/**
 * Los roles que puede tener alguien del personal, derivados de la lista de
 * arriba. Tipar la lista como `Role[]` borraba esta información y obligaba a
 * castear en cada lugar que necesitaba el conjunto acotado.
 */
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

/** Angosta un rol cualquiera a los asignables, para filtrar sin aserciones. */
export const isAssignableRole = (role: string): role is AssignableRole =>
    ASSIGNABLE_ROLES.some((assignable) => assignable === role)

/**
 * La vuelta está dada a propósito: se recorre `allowed` (que ya son Role) y se
 * pregunta si están en `roles`. Al revés hacía falta castear cada string que
 * viene del backend.
 */
export const hasRole = (roles: readonly string[] | undefined, ...allowed: Role[]): boolean =>
    allowed.some((role) => roles?.includes(role) ?? false)
