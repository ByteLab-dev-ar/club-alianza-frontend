import { describe, expect, it } from 'vitest'

import { initialsOf } from './initials'

describe('initialsOf', () => {
    it('toma el primer nombre y el último apellido', () => {
        expect(initialsOf('Ricardo Méndez')).toBe('RM')
    })

    it('con nombres compuestos no se queda con las dos primeras palabras', () => {
        // "MD" sería la inicial de "de": el círculo tiene que decir quién es.
        expect(initialsOf('María de los Ángeles Pérez')).toBe('MP')
    })

    it('respeta las tildes y la eñe en mayúscula', () => {
        expect(initialsOf('ángel ñuñez')).toBe('ÁÑ')
    })

    it('un solo nombre da una sola letra', () => {
        expect(initialsOf('Florencia')).toBe('F')
    })

    it('no se confunde con espacios de más', () => {
        // El nombre lo carga una persona desde el panel: espacios dobles y al
        // borde pasan.
        expect(initialsOf('  Pablo   Iturri ')).toBe('PI')
    })

    it('un nombre vacío no rompe', () => {
        expect(initialsOf('')).toBe('')
        expect(initialsOf('   ')).toBe('')
    })
})
