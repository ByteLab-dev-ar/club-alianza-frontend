import { describe, expect, it } from 'vitest'

import type { CounterPerson } from '../interfaces/Counter'
import {
    chargeableConcepts,
    collidingTransfers,
    toggleCounterPick,
    type CounterSelection,
} from './counter-selection'

/** Lo mínimo que mira el mostrador: coberturas, marca de jugador y pendientes. */
const personWith = (overrides: Partial<CounterPerson>): CounterPerson =>
    ({
        id: 'tomas',
        name: 'Tomás',
        surname: 'Gómez',
        isPlayer: false,
        isActive: false,
        isActivityUpToDate: false,
        isInsuranceUpToDate: false,
        pendingTransfers: [],
        ...overrides,
    }) as CounterPerson

describe('chargeableConcepts', () => {
    it('no ofrece actividad ni seguro a quien no está marcado como jugador', () => {
        // El POST responde 422: la actividad y el seguro son solo del jugador.
        const applicable = chargeableConcepts(personWith({})).filter((row) => row.applies)

        expect(applicable.map((row) => row.concept)).toEqual(['MEMBERSHIP'])
    })

    it('marca como cubierto lo que ya está al día este mes', () => {
        // Las coberturas se normalizan a fin de mes, así que `isActive` en true
        // significa que el mes corriente ya está pago — y cobrarlo otra vez es
        // un 409.
        const rows = chargeableConcepts(personWith({ isPlayer: true, isActive: true }))

        expect(rows.find((row) => row.concept === 'MEMBERSHIP')?.covered).toBe(true)
        expect(rows.find((row) => row.concept === 'ACTIVITY')?.covered).toBe(false)
    })
})

describe('toggleCounterPick', () => {
    it('suma la membresía al tildar la actividad de quien no la tiene al día', () => {
        const player = personWith({ isPlayer: true })

        expect(toggleCounterPick({}, player, 'ACTIVITY').tomas).toEqual(
            expect.arrayContaining(['ACTIVITY', 'MEMBERSHIP']),
        )
    })

    it('no la suma si la membresía ya está al día', () => {
        // La cadena se evalúa sobre cómo queda la persona DESPUÉS del pago: si
        // ya está cubierta, no hay nada que arrastrar — y cobrarla de nuevo
        // sería un 409.
        const player = personWith({ isPlayer: true, isActive: true })

        expect(toggleCounterPick({}, player, 'ACTIVITY').tomas).toEqual(['ACTIVITY'])
    })

    it('arrastra la cadena entera al tildar el seguro', () => {
        const player = personWith({ isPlayer: true })

        expect(toggleCounterPick({}, player, 'INSURANCE').tomas).toEqual(
            expect.arrayContaining(['INSURANCE', 'ACTIVITY', 'MEMBERSHIP']),
        )
    })

    it('saca lo que dependía del concepto al destildarlo', () => {
        const player = personWith({ isPlayer: true })
        const full: CounterSelection = { tomas: ['MEMBERSHIP', 'ACTIVITY', 'INSURANCE'] }

        expect(toggleCounterPick(full, player, 'MEMBERSHIP')).toEqual({})
    })
})

describe('collidingTransfers', () => {
    it('encuentra las transferencias pendientes que el cobro va a pisar', () => {
        // Sin este aviso el rechazo pasa en silencio y la familia que transfirió
        // Y pagó en efectivo se entera sola.
        const person = personWith({
            pendingTransfers: [
                { concept: 'MEMBERSHIP', month: '2026-09' },
                { concept: 'ACTIVITY', month: '2026-09' },
            ],
        })

        const collisions = collidingTransfers([person], { tomas: ['MEMBERSHIP'] })

        expect(collisions).toHaveLength(1)
        expect(collisions[0]?.transfer.concept).toBe('MEMBERSHIP')
    })

    it('no reporta nada si lo tildado no se pisa con lo pendiente', () => {
        const person = personWith({
            pendingTransfers: [{ concept: 'INSURANCE', month: '2026-09' }],
        })

        expect(collidingTransfers([person], { tomas: ['MEMBERSHIP'] })).toEqual([])
    })
})
