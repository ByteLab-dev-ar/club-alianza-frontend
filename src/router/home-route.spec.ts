import { describe, expect, it } from 'vitest'
import { Roles } from '@/constants/roles'
import { homeRouteForRoles } from './home-route'

/**
 * A dónde cae cada tipo de cuenta al loguearse. Esto rompió una vez (recepción
 * rebotaba entre guards por caer en /mi-cuenta): el orden de prioridad importa.
 */
describe('homeRouteForRoles', () => {
    it('el staff del panel arranca en /admin', () => {
        expect(homeRouteForRoles([Roles.ADMIN])).toBe('/admin')
        expect(homeRouteForRoles([Roles.ACCOUNTANT])).toBe('/admin')
        expect(homeRouteForRoles([Roles.WEB_ADMIN])).toBe('/admin')
    })

    it('recepción arranca en el escáner, no en el portal de socio', () => {
        expect(homeRouteForRoles([Roles.RECEPTION])).toBe('/puerta')
    })

    it('una cuenta híbrida socio+recepción también cae en el escáner', () => {
        expect(homeRouteForRoles([Roles.USER, Roles.RECEPTION])).toBe('/puerta')
    })

    it('si además tiene un rol de panel, gana el panel', () => {
        expect(homeRouteForRoles([Roles.RECEPTION, Roles.ADMIN])).toBe('/admin')
    })

    it('el socio (o una sesión sin roles) va a su cuenta', () => {
        expect(homeRouteForRoles([Roles.USER])).toBe('/mi-cuenta')
        expect(homeRouteForRoles([])).toBe('/mi-cuenta')
        expect(homeRouteForRoles(undefined)).toBe('/mi-cuenta')
    })
})
