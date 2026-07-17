import type { Role } from '@/constants/roles'

/** `UserResponseDto` — usuario de staff/administrador (sin password). */
export interface StaffUser {
    id: string
    email: string
    roles: Role[]
    isActive: boolean
    isEmailVerified: boolean
    createdAt: string
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
}
