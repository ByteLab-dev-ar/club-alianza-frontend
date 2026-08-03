import { describe, expect, it } from 'vitest'
import { hasRole, isAssignableRole, Roles } from './roles'

describe('hasRole', () => {
    it('alcanza con tener UNO de los roles pedidos', () => {
        expect(hasRole(['user', 'accountant'], Roles.ADMIN, Roles.ACCOUNTANT)).toBe(true)
    })

    it('false si no tiene ninguno', () => {
        expect(hasRole(['user'], Roles.ADMIN)).toBe(false)
    })

    it('tolera roles undefined o vacíos (usuario sin sesión)', () => {
        expect(hasRole(undefined, Roles.ADMIN)).toBe(false)
        expect(hasRole([], Roles.ADMIN)).toBe(false)
    })

    it('no matchea por prefijo ni substring', () => {
        // 'admin' no debe matchear contra un hipotético rol 'web_admin' del array.
        expect(hasRole(['web_admin'], Roles.ADMIN)).toBe(false)
    })
})

describe('isAssignableRole', () => {
    it('acepta los cuatro roles del personal, incluida recepción', () => {
        expect(isAssignableRole('admin')).toBe(true)
        expect(isAssignableRole('accountant')).toBe(true)
        expect(isAssignableRole('web_admin')).toBe(true)
        expect(isAssignableRole('reception')).toBe(true)
    })

    it('rechaza el rol de socio y cualquier string desconocido', () => {
        expect(isAssignableRole('user')).toBe(false)
        expect(isAssignableRole('root')).toBe(false)
    })
})
