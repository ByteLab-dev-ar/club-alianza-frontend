import { describe, expect, it } from 'vitest'

import type { RosterByCategoryStats } from '../interfaces/AdminStats'
import {
    activityOverdueStat,
    membershipStat,
    monthlyIncomeHint,
    partOfTotal,
    pendingReceiptsHint,
} from './dashboard-row'

/** Un plantel de dos categorías, como lo mandaría el servidor. */
const roster = (
    reserva: [players: number, upToDate: number],
    quinta: [players: number, upToDate: number],
    withoutCategory = 0,
): RosterByCategoryStats => ({
    categories: [
        { category: 'RESERVA', players: reserva[0], activityUpToDate: reserva[1] },
        { category: 'QUINTA', players: quinta[0], activityUpToDate: quinta[1] },
    ],
    withoutCategory,
})

describe('partOfTotal', () => {
    it('escribe la parte y su total', () => {
        expect(partOfTotal(262, 450)).toBe('262 de 450')
        expect(partOfTotal(0, 12)).toBe('0 de 12')
    })
})

describe('membershipStat', () => {
    it('el total del padrón va en el número y el porcentaje al pie', () => {
        expect(membershipStat({ activeMembers: 262, totalMembers: 450 })).toEqual({
            value: '262 de 450',
            hint: 'El 58% del padrón',
        })
    })

    it('no redondea a 100% mientras quede alguien con la membresía vencida', () => {
        expect(membershipStat({ activeMembers: 449, totalMembers: 450 }).hint).toBe(
            'El 99% del padrón',
        )
        expect(membershipStat({ activeMembers: 450, totalMembers: 450 }).hint).toBe(
            'El 100% del padrón',
        )
    })

    it('con nadie vigente da 0%, que es un dato y no la falta de uno', () => {
        expect(membershipStat({ activeMembers: 0, totalMembers: 30 })).toEqual({
            value: '0 de 30',
            hint: 'El 0% del padrón',
        })
    })

    it('con el padrón vacío no divide por cero ni escribe "0 de 0"', () => {
        expect(membershipStat({ activeMembers: 0, totalMembers: 0 })).toEqual({
            value: '0',
            hint: 'Todavía no hay socios en el padrón',
        })
    })
})

describe('activityOverdueStat', () => {
    it('cuenta los que deben la actividad, de todos los jugadores con categoría', () => {
        // 30 jugadores, 22 con la actividad paga: deben 8.
        expect(activityOverdueStat(roster([10, 7], [20, 15]))).toEqual({
            value: '8 de 30',
            hint: 'Jugadores que deben la actividad',
        })
    })

    it('los sin categoría no entran en el total: de esos no se sabe si pagaron', () => {
        // El mismo total que el gráfico de plantel, que los nombra aparte.
        expect(activityOverdueStat(roster([10, 7], [20, 15], 5)).value).toBe('8 de 30')
    })

    it('con todos con la actividad paga dice cero, no esconde la tarjeta', () => {
        expect(activityOverdueStat(roster([10, 10], [20, 20])).value).toBe('0 de 30')
    })

    it('sin jugadores no escribe "0 de 0"', () => {
        expect(activityOverdueStat(roster([0, 0], [0, 0]))).toEqual({
            value: '0',
            hint: 'No hay jugadores con categoría',
        })
        // Tampoco cuando los únicos jugadores no tienen categoría posible.
        expect(activityOverdueStat(roster([0, 0], [0, 0], 4)).value).toBe('0')
    })
})

describe('pendingReceiptsHint', () => {
    it('dice que son transferencias, en singular y en plural', () => {
        expect(pendingReceiptsHint(1)).toBe('Transferencia esperando revisión')
        expect(pendingReceiptsHint(3)).toBe('Transferencias esperando revisión')
    })

    it('en cero no dice "al día"', () => {
        expect(pendingReceiptsHint(0)).toBe('Nada para revisar')
    })
})

describe('monthlyIncomeHint', () => {
    it('nombra el mes y aclara que todavía no cerró', () => {
        expect(monthlyIncomeHint('2026-09')).toBe('Pagos aprobados en septiembre, hasta hoy')
        expect(monthlyIncomeHint('2027-01')).toBe('Pagos aprobados en enero, hasta hoy')
    })
})
