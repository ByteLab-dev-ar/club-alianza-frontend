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
    /**
     * Null = activo. Con fecha = dado de baja por un admin.
     *
     * No es lo mismo que `isActive: false`: eso también pasa cuando la cuenta
     * nunca verificó su mail. Para distinguir "baja administrativa" de
     * "invitación sin aceptar" hay que mirar este campo, no `isActive`.
     */
    deactivatedAt: string | null
    /**
     * Si además es socio del club. Tener cuenta no alcanza: ser socio es un alta
     * deliberada (con cuota y credencial), y hay personal que no lo es.
     *
     * De acá depende qué pasa al quitar a alguien del personal: el socio conserva
     * su cuenta, el que no lo es la pierde (no le queda motivo para tenerla).
     */
    isMember: boolean
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
