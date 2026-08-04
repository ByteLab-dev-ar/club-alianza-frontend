import { describe, expect, it } from 'vitest'
import { passwordField, PASSWORD_REGEX, dniField, phoneField, moneyField, MONEY_MAX } from './fields'

/**
 * Los casos de contraseña son los MISMOS que enumeró el backend al unificar la
 * regla (ver PASSWORD_REGEX en su password.constant.ts, que tiene su propio
 * spec espejo). Si este test falla, front y back divergieron.
 */
describe('passwordField', () => {
    it.each([
        'P@ssword123',
        'Abc123.',
        'Abc123-',
        'Abc123_',
        'Ñandú123!',
        'Contraseña1!',
        'Abc 123!',
    ])('acepta %s', (password) => {
        expect(passwordField.safeParse(password).success).toBe(true)
    })

    it.each([
        ['abc123!', 'sin mayúscula'],
        ['ABC123!', 'sin minúscula'],
        ['Abcdef!', 'sin número'],
        ['Abc1234', 'sin símbolo'],
        ['Ab1!', 'muy corta'],
    ])('rechaza %s (%s)', (password) => {
        expect(passwordField.safeParse(password).success).toBe(false)
    })

    it('rechaza más de 64 caracteres', () => {
        const larga = `Aa1!${'x'.repeat(70)}`
        expect(passwordField.safeParse(larga).success).toBe(false)
    })

    it('la regex compilada exige el flag u (sin él \\p{...} no funciona)', () => {
        expect(PASSWORD_REGEX.flags).toContain('u')
    })
})

describe('dniField', () => {
    it('acepta 7 a 9 dígitos y el string vacío (campo opcional en forms)', () => {
        expect(dniField.safeParse('38452119').success).toBe(true)
        expect(dniField.safeParse('1234567').success).toBe(true)
        expect(dniField.safeParse('').success).toBe(true)
    })

    it('rechaza letras, puntos y longitudes fuera de rango', () => {
        expect(dniField.safeParse('38.452.119').success).toBe(false)
        expect(dniField.safeParse('123456').success).toBe(false)
        expect(dniField.safeParse('1234567890').success).toBe(false)
    })
})

describe('phoneField', () => {
    it('respeta el tope de 30 del DTO del backend', () => {
        expect(phoneField.safeParse('+54 9 299 415 2012').success).toBe(true)
        expect(phoneField.safeParse('9'.repeat(31)).success).toBe(false)
    })
})

describe('moneyField', () => {
    it.each([8500, 8500.5, 8500.55, MONEY_MAX])('acepta %s', (amount) => {
        expect(moneyField.safeParse(amount).success).toBe(true)
    })

    it('acepta montos altos: el socio atrasado paga varios meses en un comprobante', () => {
        // El tope es el del DECIMAL(10,2) del backend, NO el de la cuota mensual:
        // el campo tiene que seguir libre.
        expect(moneyField.safeParse(250_000).success).toBe(true)
    })

    it.each([0, -1])('rechaza %s', (amount) => {
        expect(moneyField.safeParse(amount).success).toBe(false)
    })

    it('rechaza más de dos decimales sin romperse con la coma flotante', () => {
        // 100.999 es el caso que delataba la implementación con `% 0.01`:
        // 100.999 * 100 da 10099.900000000001 y hacía fallar montos válidos.
        expect(moneyField.safeParse(100.999).success).toBe(false)
        expect(moneyField.safeParse(100.99).success).toBe(true)
    })

    it('rechaza por encima del DECIMAL(10,2) del backend', () => {
        expect(moneyField.safeParse(100_000_000).success).toBe(false)
    })
})
