import type { Role } from '@/constants/roles'
import type { SessionUser } from '@/auth/interfaces/User'

/**
 * `UserResponseDto` — cuenta del sistema vista desde el panel.
 *
 * Es la misma shape que devuelve GET /users/me, así que se deriva en vez de
 * copiarse: antes eran dos interfaces idénticas campo por campo y un cambio en
 * el DTO obligaba a acordarse de tocar las dos.
 */
export type StaffUser = SessionUser

/**
 * Filtros de GET /admin/users.
 *
 * Por defecto el endpoint devuelve SOLO personal (cualquier rol distinto de
 * `user`). Antes devolvía todas las cuentas y con el alta masiva los socios
 * aparecían en la pantalla de Administradores.
 */
export interface StaffQuery {
    page?: number
    limit?: number
    role?: Role
    /** Coincidencia parcial por email. Se combina con el resto de los filtros. */
    search?: string
    /**
     * Todas las cuentas, socios incluidos. Solo para el buscador de "sumar al
     * personal a alguien que ya tiene cuenta": para las bajas está `deactivated`,
     * que no arrastra los ~250 socios del padrón.
     */
    includeMembers?: boolean
    /**
     * Solo cuentas dadas de baja, sin importar el rol. Tiene precedencia sobre
     * `role` e `includeMembers` en el backend. Es el único camino para llegar a
     * ellas: la baja también saca los roles, así que dejan de ser personal y
     * desaparecen del listado por defecto.
     */
    deactivated?: boolean
}

/** Alta directa: el admin define la contraseña acá mismo. */
export interface CreateStaffPayload {
    name: string
    surname: string
    email: string
    password: string
    roles: Role[]
}

/** Invitación: no lleva contraseña, la persona la define desde el mail. */
export interface InviteStaffPayload {
    name: string
    surname: string
    email: string
    roles: Role[]
    /**
     * Si además se lo da de alta como socio del club. Default false: ser socio
     * es un alta deliberada, no un efecto secundario de tener un cargo.
     */
    isAlsoMember?: boolean
}
