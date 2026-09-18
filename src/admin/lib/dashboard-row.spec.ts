import { describe, expect, it } from 'vitest'

import { monthlyIncomeHint, pendingTransfersHint } from './dashboard-row'

describe('pendingTransfersHint', () => {
    it('con algo en la bandeja dice que espera, en singular y en plural', () => {
        // El rótulo ya dice "Transferencias": el pie no lo repite.
        expect(pendingTransfersHint(1)).toBe('Esperando revisión')
        expect(pendingTransfersHint(3)).toBe('Esperando revisión')
    })

    it('en cero no dice "al día"', () => {
        expect(pendingTransfersHint(0)).toBe('Nada para revisar')
    })
})

describe('monthlyIncomeHint', () => {
    it('nombra el mes y aclara que todavía no cerró', () => {
        expect(monthlyIncomeHint('2026-09')).toBe('Pagos aprobados en septiembre, hasta hoy')
        expect(monthlyIncomeHint('2027-01')).toBe('Pagos aprobados en enero, hasta hoy')
    })
})
