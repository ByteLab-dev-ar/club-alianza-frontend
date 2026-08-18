import { describe, expect, it } from 'vitest'

import type { CounterPerson } from '../interfaces/Counter'
import { collidingTransfers } from './counter-collisions'

/** Lo mínimo que mira este cálculo: quién es y qué tiene esperando validación. */
const personWith = (overrides: Partial<CounterPerson>): CounterPerson =>
    ({
        id: 'tomas',
        name: 'Tomás',
        surname: 'Gómez',
        payable: [],
        notes: [],
        pendingTransfers: [],
        ...overrides,
    }) as CounterPerson

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

    it('mira a cada persona contra lo suyo, no contra la selección entera', () => {
        // La familia se cobra en una sola operación: el pendiente del hermano no
        // se pisa porque al hermano no se le tildó nada.
        const tomas = personWith({
            pendingTransfers: [{ concept: 'MEMBERSHIP', month: '2026-09' }],
        })
        const ana = personWith({
            id: 'ana',
            pendingTransfers: [{ concept: 'MEMBERSHIP', month: '2026-09' }],
        })

        const collisions = collidingTransfers([tomas, ana], { tomas: ['MEMBERSHIP'] })

        expect(collisions).toHaveLength(1)
        expect(collisions[0]?.person.id).toBe('tomas')
    })
})
