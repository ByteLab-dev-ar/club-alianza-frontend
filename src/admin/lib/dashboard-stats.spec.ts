import { describe, expect, it } from 'vitest'

import type { RosterByCategoryStats, StatsCategory } from '../interfaces/AdminStats'
import {
    categoryLabel,
    countLabel,
    debtSummary,
    incomeSummary,
    membershipFlowSummary,
    methodLabel,
    monthTickLabel,
    orderCategoriesForDisplay,
    paymentMethodsSummary,
    pyramidSummary,
    rosterSummary,
    signed,
} from './dashboard-stats'

/** Las nueve, en el orden del enum: como las manda el servidor. */
const ENUM_ORDER: StatsCategory[] = [
    'RESERVA',
    'QUINTA',
    'SEXTA',
    'SEPTIMA',
    'OCTAVA',
    'NOVENA',
    'DECIMA',
    'PREDECIMA',
    'ESCUELITA',
]

const roster = (withoutCategory = 0): RosterByCategoryStats => ({
    categories: ENUM_ORDER.map((category, i) => ({ category, players: i, activityUpToDate: 0 })),
    withoutCategory,
})

describe('rótulos', () => {
    it('la categoría se escribe como la escribe el servidor, no como la maqueta', () => {
        // `PLAYER_CATEGORY_LABELS` del backend: "7ma", no "Séptima".
        expect(categoryLabel('SEPTIMA')).toBe('7ma')
        expect(methodLabel('MERCADO_PAGO')).toBe('Mercado Pago')
    })

    it('un valor que el front no conoce se muestra crudo en vez de quedar en blanco', () => {
        expect(categoryLabel('PRIMERA' as StatsCategory)).toBe('PRIMERA')
    })

    it('el año del mes aparece solo en enero', () => {
        expect(monthTickLabel('2026-01')).toBe('ene 26')
        expect(monthTickLabel('2025-10')).toBe('oct')
    })

    it('cuenta en singular y plural', () => {
        expect(countLabel(1, 'socio', 'socios')).toBe('1 socio')
        expect(countLabel(0, 'socio', 'socios')).toBe('0 socios')
    })

    it('el neto negativo no lleva un "+" delante', () => {
        // La maqueta escribía `+${altas - bajas}`, que da "+-3".
        expect(signed(3)).toBe('+3')
        expect(signed(-3)).toBe('-3')
        expect(signed(0)).toBe('0')
    })
})

describe('orderCategoriesForDisplay', () => {
    it('va de la Escuelita a Reserva, al revés del enum', () => {
        expect(orderCategoriesForDisplay(roster().categories).map((c) => c.category)).toEqual(
            [...ENUM_ORDER].reverse(),
        )
    })

    it('no saca ninguna: las vacías se quedan, y una desconocida va al final', () => {
        const categories = [
            { category: 'PRIMERA', players: 3 },
            { category: 'RESERVA', players: 0 },
            { category: 'ESCUELITA', players: 4 },
        ]

        expect(orderCategoriesForDisplay(categories).map((c) => c.category)).toEqual([
            'ESCUELITA',
            'RESERVA',
            'PRIMERA',
        ])
    })

    it('no reordena el arreglo que recibe, que es el de la caché', () => {
        const stats = roster()
        orderCategoriesForDisplay(stats.categories)

        expect(stats.categories.map((c) => c.category)).toEqual(ENUM_ORDER)
    })
})

describe('rosterSummary', () => {
    it('los sin categoría no están en ninguna barra pero sí en el total', () => {
        const summary = rosterSummary(roster(5))

        // 0 + 1 + ... + 8 jugadores con categoría.
        expect(summary.players).toBe(36)
        expect(summary.withoutCategory).toBe(5)
        expect(summary.total).toBe(41)
        expect(summary.emptyCategories).toBe(1)
    })
})

describe('pyramidSummary', () => {
    it('el total es el padrón: nadie que la pirámide no dibuja queda afuera', () => {
        const summary = pyramidSummary({
            bands: [
                { band: '0-12', female: 1, male: 3 },
                { band: '13-17', female: 0, male: 2 },
                { band: '18-29', female: 0, male: 0 },
                { band: '30-44', female: 0, male: 0 },
                { band: '45-59', female: 0, male: 0 },
                { band: '60+', female: 0, male: 0 },
            ],
            sexX: 1,
            unknownSex: 9,
            unknownBornDate: 2,
        })

        expect(summary.female + summary.male).toBe(6)
        expect(summary.total).toBe(18)
        expect(summary.max).toBe(3)
    })
})

describe('debtSummary', () => {
    const stats = {
        buckets: [
            { bucket: 'UP_TO_1M' as const, members: 6 },
            { bucket: 'FROM_1_TO_3M' as const, members: 4 },
            { bucket: 'FROM_3_TO_6M' as const, members: 3 },
            { bucket: 'OVER_6M' as const, members: 2 },
        ],
        noExpirationDate: 3,
    }

    it('los que pasaron los tres meses son solo los dos tramos largos', () => {
        expect(debtSummary(stats).pastThreshold).toBe(5)
    })

    it('los sin vencimiento no entran en ningún tramo, pero no se pierden', () => {
        const summary = debtSummary(stats)

        expect(summary.inBuckets).toBe(15)
        expect(summary.total).toBe(18)
    })
})

describe('paymentMethodsSummary', () => {
    it('el portal es todo lo que no es el mostrador', () => {
        const summary = paymentMethodsSummary({
            total: 400,
            methods: [
                { method: 'CASH', amount: 100, payments: 1 },
                { method: 'TRANSFER', amount: 200, payments: 2 },
                { method: 'MERCADO_PAGO', amount: 100, payments: 1 },
            ],
        })

        expect(summary.portalShare).toBe(0.75)
        expect(summary.payments).toBe(4)
    })

    it('sin plata en el período, las partes son cero y no NaN', () => {
        const summary = paymentMethodsSummary({
            total: 0,
            methods: [
                { method: 'CASH', amount: 0, payments: 0 },
                { method: 'TRANSFER', amount: 0, payments: 0 },
                { method: 'MERCADO_PAGO', amount: 0, payments: 0 },
            ],
        })

        expect(summary.rows.map((row) => row.share)).toEqual([0, 0, 0])
        expect(summary.portalShare).toBe(0)
    })
})

describe('incomeSummary', () => {
    it('el total de un mes es la suma de sus tres conceptos', () => {
        const summary = incomeSummary({
            months: [
                { month: '2026-08', membership: 27_000, activity: 9_000, insurance: 2_400 },
                { month: '2026-09', membership: 27_000, activity: 9_000, insurance: 2_000 },
            ],
        })

        expect(summary.rows.map((row) => row.total)).toEqual([38_400, 38_000])
        expect(summary.total).toBe(76_400)
        expect(summary.max).toBe(38_400)
    })
})

describe('membershipFlowSummary', () => {
    it('el neto del período puede ser negativo', () => {
        const summary = membershipFlowSummary({
            months: [
                { month: '2026-08', joined: 1, left: 3 },
                { month: '2026-09', joined: 0, left: 1 },
            ],
        })

        expect(summary.net).toBe(-3)
        expect(summary.rows.map((row) => row.net)).toEqual([-2, -1])
        expect(summary.maxLeft).toBe(3)
    })
})
