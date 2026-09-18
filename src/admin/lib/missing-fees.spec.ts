import { describe, expect, it } from 'vitest'

import { conceptsWithoutFee, missingFeesNotice } from './missing-fees'

describe('conceptsWithoutFee', () => {
    it('con los tres montos cargados no falta ninguno', () => {
        expect(conceptsWithoutFee({ MEMBERSHIP: 15_000, ACTIVITY: 9_000, INSURANCE: 2_000 })).toEqual(
            [],
        )
    })

    it('cero es un monto, no uno sin cargar', () => {
        // Un concepto gratis a propósito no puede dejar el aviso prendido.
        expect(conceptsWithoutFee({ MEMBERSHIP: 15_000, ACTIVITY: 0, INSURANCE: 0 })).toEqual([])
    })

    it('devuelve los que están en null, en el orden de la cuota', () => {
        expect(conceptsWithoutFee({ INSURANCE: null, ACTIVITY: 9_000, MEMBERSHIP: null })).toEqual([
            'MEMBERSHIP',
            'INSURANCE',
        ])
    })

    it('una clave que no vino cuenta como sin cargar, igual que en Montos', () => {
        expect(conceptsWithoutFee({ MEMBERSHIP: 15_000, ACTIVITY: 9_000 })).toEqual(['INSURANCE'])
        expect(conceptsWithoutFee({})).toEqual(['MEMBERSHIP', 'ACTIVITY', 'INSURANCE'])
    })
})

describe('missingFeesNotice', () => {
    it('sin nada que falte no hay aviso', () => {
        expect(missingFeesNotice([], '2026-09')).toBeNull()
    })

    it('nombra el concepto y el mes, en singular', () => {
        expect(missingFeesNotice(['ACTIVITY'], '2026-09')).toBe(
            'Falta cargar el monto de la actividad de septiembre: no se puede cobrar hasta que esté.',
        )
    })

    it('con dos, en plural y con el artículo de cada uno', () => {
        expect(missingFeesNotice(['MEMBERSHIP', 'INSURANCE'], '2026-09')).toBe(
            'Falta cargar los montos de la membresía y del seguro de septiembre: no se pueden cobrar hasta que estén.',
        )
    })

    it('con los tres, separados por coma y la "y" al final', () => {
        expect(missingFeesNotice(['MEMBERSHIP', 'ACTIVITY', 'INSURANCE'], '2027-01')).toBe(
            'Falta cargar los montos de la membresía, de la actividad y del seguro de enero: no se pueden cobrar hasta que estén.',
        )
    })
})
