import { describe, expect, it } from 'vitest'

import type { PayableConcept, PaymentConcept } from '../interfaces/Payment'
import {
    isPicked,
    selectedTotal,
    togglePick,
    type PayablePerson,
    type PayableSelection,
} from './payable-selection'

const payable = (
    concept: PaymentConcept,
    requires: PaymentConcept[] = [],
    amount = 1000,
): PayableConcept => ({
    concept,
    month: '2026-09',
    amount,
    listAmount: amount,
    hasFamilyDiscount: false,
    requires,
})

/** El caso central: un jugador el día 1 del mes, sin nada pago todavía. */
const player: PayablePerson = {
    profileId: 'tomas',
    payable: [
        payable('MEMBERSHIP'),
        payable('ACTIVITY', ['MEMBERSHIP'], 2000),
        payable('INSURANCE', ['MEMBERSHIP', 'ACTIVITY'], 500),
    ],
}

describe('togglePick', () => {
    it('arrastra los requires al tildar la actividad', () => {
        // Sin esto la pantalla manda la actividad sola y el POST responde 422:
        // la cadena se evalúa sobre cómo queda la persona DESPUÉS del pago, así
        // que las dos tienen que viajar juntas.
        const result = togglePick({}, player, 'ACTIVITY')

        expect(result.tomas).toEqual(expect.arrayContaining(['ACTIVITY', 'MEMBERSHIP']))
        expect(result.tomas).toHaveLength(2)
    })

    it('arrastra la cadena entera al tildar el seguro', () => {
        const result = togglePick({}, player, 'INSURANCE')

        expect(result.tomas).toEqual(
            expect.arrayContaining(['INSURANCE', 'ACTIVITY', 'MEMBERSHIP']),
        )
        expect(result.tomas).toHaveLength(3)
    })

    it('no arrastra nada cuando el servidor manda el concepto suelto', () => {
        // A quien ya tiene la membresía paga se le ofrece la actividad con
        // `requires: []`: la cadena la resuelve el servidor y acá no se deduce
        // nada del estado de la persona. Cobrarle de nuevo la membresía sería
        // un 409.
        const upToDate: PayablePerson = { profileId: 'ana', payable: [payable('ACTIVITY')] }

        expect(togglePick({}, upToDate, 'ACTIVITY').ana).toEqual(['ACTIVITY'])
    })

    it('no duplica lo que ya estaba tildado', () => {
        const withMembership: PayableSelection = { tomas: ['MEMBERSHIP'] }

        expect(togglePick(withMembership, player, 'ACTIVITY').tomas).toHaveLength(2)
    })

    it('saca lo que dependía del concepto al destildarlo', () => {
        // Destildar la membresía y dejar la actividad sola en el carrito
        // mostraría el error recién al enviar, después de haber elegido el
        // comprobante.
        const full: PayableSelection = { tomas: ['MEMBERSHIP', 'ACTIVITY', 'INSURANCE'] }

        expect(togglePick(full, player, 'MEMBERSHIP')).toEqual({})
    })

    it('destildar el seguro no toca lo que está debajo en la cadena', () => {
        const full: PayableSelection = { tomas: ['MEMBERSHIP', 'ACTIVITY', 'INSURANCE'] }

        expect(togglePick(full, player, 'INSURANCE').tomas).toEqual(['MEMBERSHIP', 'ACTIVITY'])
    })

    it('saca a la persona del objeto cuando no le queda nada tildado', () => {
        // El backend rechaza con 400 una entrada con `concepts: []`.
        const only: PayableSelection = { tomas: ['MEMBERSHIP'] }

        expect(togglePick(only, player, 'MEMBERSHIP')).toEqual({})
    })

    it('no toca la selección de las otras personas', () => {
        const shared: PayableSelection = { tomas: ['MEMBERSHIP'], ana: ['MEMBERSHIP'] }

        expect(togglePick(shared, player, 'MEMBERSHIP').ana).toEqual(['MEMBERSHIP'])
    })
})

describe('isPicked', () => {
    it('distingue lo tildado de lo que no está en la selección', () => {
        const selection: PayableSelection = { tomas: ['MEMBERSHIP'] }

        expect(isPicked(selection, 'tomas', 'MEMBERSHIP')).toBe(true)
        expect(isPicked(selection, 'tomas', 'ACTIVITY')).toBe(false)
        expect(isPicked(selection, 'ana', 'MEMBERSHIP')).toBe(false)
    })
})

describe('selectedTotal', () => {
    it('suma solo lo tildado de cada persona', () => {
        const selection: PayableSelection = { tomas: ['MEMBERSHIP', 'ACTIVITY'] }

        expect(selectedTotal([player], selection)).toBe(3000)
    })

    it('suma a través de varias personas: la familia se cobra de una', () => {
        const hermana: PayablePerson = {
            profileId: 'ana',
            payable: [payable('MEMBERSHIP', [], 500)],
        }
        const selection: PayableSelection = { tomas: ['MEMBERSHIP'], ana: ['MEMBERSHIP'] }

        expect(selectedTotal([player, hermana], selection)).toBe(1500)
    })

    it('es cero sin nada tildado', () => {
        expect(selectedTotal([player], {})).toBe(0)
    })
})
