import { describe, expect, it } from 'vitest'

import { DocumentTypes, MembershipStatuses } from '../interfaces/MemberProfile'
import { isIdentityLocked, isLockedIdentityField } from './identity-lock'

describe('isIdentityLocked', () => {
    it('el socio aprobado tiene el DNI congelado', () => {
        expect(isIdentityLocked(MembershipStatuses.MEMBER)).toBe(true)
    })

    it('quien todavía no es socio lo puede cargar', () => {
        // Es el caso normal de la puerta 1: se afilia solo y el DNI es uno de
        // los requisitos que tiene que subir para poder presentar.
        expect(isIdentityLocked(MembershipStatuses.REGISTERED)).toBe(false)
    })

    it('con la solicitud en revisión NO es este el candado', () => {
        // PENDING también bloquea, pero por `frozen` y de forma transitoria: se
        // levanta cancelando la solicitud. Si esta función devolviera true, la
        // pantalla mandaría a la sede a alguien que solo tiene que cancelar.
        expect(isIdentityLocked(MembershipStatuses.PENDING)).toBe(false)
    })

    it('sin perfil cargado no bloquea nada', () => {
        expect(isIdentityLocked(undefined)).toBe(false)
    })
})

describe('isLockedIdentityField', () => {
    it('los dos lados del DNI son documentos de identidad', () => {
        expect(isLockedIdentityField(DocumentTypes.DNI_FRONT)).toBe(true)
        expect(isLockedIdentityField(DocumentTypes.DNI_BACK)).toBe(true)
    })

    it('la ficha de afiliación NO lo es', () => {
        // El backend la deja fuera de la guarda: tiene sus propios endpoints, y
        // el socio del padrón histórico todavía tiene que firmarla.
        expect(isLockedIdentityField(DocumentTypes.AFFILIATION_FORM)).toBe(false)
    })

    it('la foto de perfil NO lo es', () => {
        // Explícito en el backend ("lo que NO se congela: el domicilio, el
        // teléfono y la foto de perfil"). Si esto diera true, el socio importado
        // se quedaría sin poder cargar la foto que le falta para la credencial.
        expect(isLockedIdentityField('photoKey')).toBe(false)
    })

    it('un campo de datos cualquiera NO lo es', () => {
        expect(isLockedIdentityField('cuil')).toBe(false)
        expect(isLockedIdentityField('address')).toBe(false)
    })
})
