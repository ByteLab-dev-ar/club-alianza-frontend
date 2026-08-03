import type { Role } from '@/constants/roles'
import type { SessionUser } from '@/auth/interfaces/User'

/**
 * `UserResponseDto` — usuario de staff/administrador (sin password).
 *
 * Es la misma shape que devuelve GET /users/me, así que se deriva en vez de
 * copiarse: antes eran dos interfaces idénticas campo por campo y un cambio en
 * el DTO obligaba a acordarse de tocar las dos.
 */
export type StaffUser = SessionUser

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
}
