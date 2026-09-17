import { describe, expect, it } from 'vitest'
import { membershipBadgeLabel, membershipStatusLabel } from './membership-label'

/*
 * Las palabras son una decisión de producto y no un detalle de presentación:
 * "Al día", que es lo que decían antes las dos pantallas, afirma que la persona
 * no debe NADA, y la membresía es una de las tres coberturas. Los tests las
 * fijan para que volver a cambiarlas sea a propósito y después de leer el
 * comentario del módulo, no de pasada mientras se toca un badge.
 */
describe('membershipStatusLabel', () => {
    it('con la membresía paga dice "Membresía vigente", nunca "Al día"', () => {
        expect(membershipStatusLabel(true)).toBe('Membresía vigente')
    })

    it('sin membresía paga dice "Membresía vencida"', () => {
        expect(membershipStatusLabel(false)).toBe('Membresía vencida')
    })

    // La forma larga nombra la cobertura: es lo que la distingue de la corta y
    // el motivo por el que existe. Sin esta palabra las dos serían la misma.
    it('nombra la cobertura en los dos estados', () => {
        expect(membershipStatusLabel(true)).toContain('Membresía')
        expect(membershipStatusLabel(false)).toContain('Membresía')
    })
})

describe('membershipBadgeLabel', () => {
    it('con la membresía paga dice "Vigente", nunca "Al día"', () => {
        expect(membershipBadgeLabel(true)).toBe('Vigente')
    })

    // Femenino, porque lo que vence es la membresía: es lo único que ata la
    // palabra sola a su rótulo cuando el rótulo está en otra línea.
    it('sin membresía paga dice "Vencida", no "Vencido"', () => {
        expect(membershipBadgeLabel(false)).toBe('Vencida')
    })

    // Las dos formas dicen lo mismo: si alguien cambia una palabra en una sola,
    // el padrón y la ficha empiezan a nombrar distinto el mismo booleano, que es
    // justo el enredo que este módulo vino a cerrar.
    it('es la forma larga sin el sustantivo', () => {
        expect(membershipStatusLabel(true)).toBe(`Membresía ${membershipBadgeLabel(true).toLowerCase()}`)
        expect(membershipStatusLabel(false)).toBe(
            `Membresía ${membershipBadgeLabel(false).toLowerCase()}`,
        )
    })
})
