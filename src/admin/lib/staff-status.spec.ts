import { describe, expect, it } from 'vitest'
import { deriveStaffStatus } from './staff-status'

/** Cuenta del personal ya aceptada y en uso; cada test cambia lo que necesita. */
const activeUser = {
    deactivatedAt: null,
    isActive: true,
    isEmailVerified: true,
}

describe('deriveStaffStatus', () => {
    it('marca como activa la cuenta verificada y en uso', () => {
        expect(deriveStaffStatus(activeUser)).toBe('active')
    })

    it('marca como pendiente al invitado que todavía no completó el link', () => {
        // Es el estado en que queda POST /admin/users/invite: la cuenta ya está
        // habilitada, pero la casilla sigue sin probarse.
        expect(deriveStaffStatus({ ...activeUser, isEmailVerified: false })).toBe('pending')
    })

    it('marca como inactiva la cuenta que nunca llegó a activarse', () => {
        // Alta con POST /admin/users: arranca inactiva y sin verificar.
        expect(
            deriveStaffStatus({ ...activeUser, isActive: false, isEmailVerified: false }),
        ).toBe('inactive')
    })

    it('la baja gana sobre isActive: una baja también deja isActive en false', () => {
        // Sin el orden correcto esto daría 'inactive' y se perdería que fue una
        // decisión de un admin y no una cuenta a medio activar.
        expect(
            deriveStaffStatus({
                deactivatedAt: '2026-08-03T19:12:32.095Z',
                isActive: false,
                isEmailVerified: false,
            }),
        ).toBe('revoked')
    })

    it('la baja gana incluso sobre una cuenta activa y verificada', () => {
        // Pasa de verdad: al restaurarle los roles a alguien dado de baja, el
        // backend NO limpia deactivatedAt.
        expect(
            deriveStaffStatus({ ...activeUser, deactivatedAt: '2026-08-03T19:12:32.095Z' }),
        ).toBe('revoked')
    })
})
