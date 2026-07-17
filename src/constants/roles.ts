/** Roles del backend (`user.roles` es un array: un usuario puede tener varios). */
export const Roles = {
    USER: 'user',
    ADMIN: 'admin',
    ACCOUNTANT: 'accountant',
    WEB_ADMIN: 'web_admin',
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

export const ROLE_LABELS: Record<Role, string> = {
    user: 'Socio',
    admin: 'Administrador',
    accountant: 'Tesorería',
    web_admin: 'Admin web',
}

/** Roles con acceso al panel /admin (cada sección adentro filtra por rol). */
export const STAFF_ROLES: Role[] = [Roles.ADMIN, Roles.ACCOUNTANT, Roles.WEB_ADMIN]

export const hasRole = (roles: string[] | undefined, ...allowed: Role[]): boolean =>
    !!roles?.some((role) => allowed.includes(role as Role))
