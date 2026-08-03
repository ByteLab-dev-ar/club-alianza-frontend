import type { StaffUser } from '../interfaces/StaffUser'

export type StaffStatus = 'revoked' | 'inactive' | 'pending' | 'active'

/**
 * Estado de una cuenta del personal, derivado de tres flags del backend.
 *
 * El ORDEN de los chequeos es la lógica, no un detalle: las condiciones se
 * superponen y la primera que da verdadero gana.
 *
 * - `deactivatedAt` va primero porque una baja también deja `isActive` en false:
 *   mirando ese flag antes, toda baja se leería como "Inactivo" y se perdería la
 *   distinción entre "lo dio de baja un admin" y "nunca llegó a activarse".
 * - `isActive` va antes que `isEmailVerified` porque los dos últimos estados
 *   asumen una cuenta ya activa; sin ese filtro, una cuenta creada con
 *   `POST /admin/users` (que arranca inactiva y sin verificar) caería en
 *   "Pendiente", que significa otra cosa.
 *
 * Vive en un módulo aparte y no dentro del badge para poder testear el orden
 * sin renderizar la tabla.
 */
export const deriveStaffStatus = (
    user: Pick<StaffUser, 'deactivatedAt' | 'isActive' | 'isEmailVerified'>,
): StaffStatus => {
    if (user.deactivatedAt !== null) return 'revoked'
    if (!user.isActive) return 'inactive'
    if (!user.isEmailVerified) return 'pending'
    return 'active'
}
