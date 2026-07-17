import type { Role } from '@/constants/roles'

/**
 * La sesión, tal como la devuelve GET /users/me — que es la ÚNICA fuente que
 * trae `roles`. Ojo: no incluye name/surname (el backend no los expone acá).
 */
export interface SessionUser {
    id: string
    email: string
    roles: Role[]
    isActive: boolean
    isEmailVerified: boolean
    createdAt: string
}

/**
 * `data` de POST /auth/login. Es un usuario recortado: trae el nombre pero NO los
 * roles, así que no alcanza para decidir a qué panel mandar a la persona — para
 * eso hay que pedir GET /users/me después del login.
 */
export interface LoginUser {
    id: string
    email: string
    name: string
}
