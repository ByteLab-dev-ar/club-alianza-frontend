import { describe, expect, it } from 'vitest'

import type {
    PaymentMethodsStats,
    RosterByCategoryStats,
    StatsCategory,
    StatsPaymentMethod,
} from '../interfaces/AdminStats'
import {
    categoryLabel,
    countLabel,
    debtSummary,
    incomeSummary,
    membershipFlowSummary,
    monthTickLabel,
    orderCategoriesForDisplay,
    percentLabel,
    portalPayments,
    portalPaymentsHint,
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

describe('percentLabel', () => {
    it('redondea al entero', () => {
        expect(percentLabel(0.375)).toBe('38%')
        expect(percentLabel(0.374)).toBe('37%')
    })

    it('el 100% y el 0% solo salen cuando del otro lado no queda nada', () => {
        expect(percentLabel(1)).toBe('100%')
        expect(percentLabel(0)).toBe('0%')
    })

    it('no llega a los extremos por redondeo', () => {
        // 199 de 200 pagos por el portal: "100%" diría que por el mostrador no
        // pasó nadie, y pasó uno.
        expect(percentLabel(199 / 200)).toBe('99%')
        // 1 de 500: "0%" diría que el portal no lo usó nadie.
        expect(percentLabel(1 / 500)).toBe('1%')
    })

    it('sin nada que repartir muestra un guion y no un cero', () => {
        expect(percentLabel(null)).toBe('—')
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

describe('portalPayments', () => {
    /** Los tres medios como los manda el servidor: `[importe, cantidad de pagos]`. */
    const stats = (
        cash: [number, number],
        transfer: [number, number],
        mercadoPago: [number, number],
    ): PaymentMethodsStats => {
        const methods = [
            { method: 'CASH' as StatsPaymentMethod, amount: cash[0], payments: cash[1] },
            { method: 'TRANSFER' as StatsPaymentMethod, amount: transfer[0], payments: transfer[1] },
            {
                method: 'MERCADO_PAGO' as StatsPaymentMethod,
                amount: mercadoPago[0],
                payments: mercadoPago[1],
            },
        ]

        return { total: methods.reduce((suma, row) => suma + row.amount, 0), methods }
    }

    it('la transferencia y Mercado Pago son el portal; el efectivo es el mostrador', () => {
        const summary = portalPayments(stats([10_000, 4], [10_000, 3], [10_000, 3]))

        expect(summary.total).toBe(10)
        expect(summary.portal).toBe(6)
        expect(percentLabel(summary.share)).toBe('60%')
    })

    it('cuenta pagos y no pesos: un atraso grande en el mostrador no hunde el número', () => {
        // Nueve socios pagaron solos y uno vino a la sede a saldar un año.
        const summary = portalPayments(stats([900_000, 1], [50_000, 4], [50_000, 5]))

        expect(percentLabel(summary.share)).toBe('90%')
        // En pesos el mismo período daría 10%, que contesta otra pregunta.
        expect(summary.share).toBe(0.9)
    })

    it('sin pagos en el período no divide por cero: no hay porcentaje', () => {
        const summary = portalPayments(stats([0, 0], [0, 0], [0, 0]))

        expect(summary.total).toBe(0)
        expect(summary.portal).toBe(0)
        expect(summary.share).toBeNull()

        // Y con la lista vacía, no solo con los tres medios en cero: el
        // contrato promete los tres, pero `sum([])` y `0 / 0` son la misma
        // trampa y acá no se paga.
        expect(portalPayments({ total: 0, methods: [] }).share).toBeNull()
    })

    it('con un solo medio da 100% o 0%, según cuál sea', () => {
        expect(portalPayments(stats([0, 0], [0, 0], [8_000, 2])).share).toBe(1)
        expect(portalPayments(stats([8_000, 2], [0, 0], [0, 0])).share).toBe(0)
    })

    it('un medio que el front todavía no conoce cuenta como presencial', () => {
        // El enum del backend es varchar: si mañana aparece DEBITO_AUTOMATICO,
        // es mejor que el número quede corto que inflado.
        const summary = portalPayments({
            total: 20_000,
            methods: [
                { method: 'CASH' as StatsPaymentMethod, amount: 0, payments: 0 },
                { method: 'TRANSFER' as StatsPaymentMethod, amount: 10_000, payments: 1 },
                { method: 'DEBITO_AUTOMATICO' as StatsPaymentMethod, amount: 10_000, payments: 1 },
            ],
        })

        expect(summary.portal).toBe(1)
        expect(summary.total).toBe(2)
    })
})

describe('portalPaymentsHint', () => {
    it('dice el período y sobre cuántos pagos se calculó', () => {
        const summary = { total: 240, portal: 91, share: 91 / 240 }

        expect(portalPaymentsHint(summary, 12)).toBe(
            'De 240 pagos aprobados en los últimos 12 meses',
        )
    })

    it('con un solo pago no escribe "1 pagos"', () => {
        expect(portalPaymentsHint({ total: 1, portal: 1, share: 1 }, 12)).toBe(
            'De 1 pago aprobado en los últimos 12 meses',
        )
    })

    it('sin pagos explica por qué no hay porcentaje', () => {
        expect(portalPaymentsHint({ total: 0, portal: 0, share: null }, 12)).toBe(
            'Sin pagos aprobados en los últimos 12 meses',
        )
    })

    it('con una ventana de un mes tampoco escribe "1 meses"', () => {
        // El servidor acepta de 1 a 24: la frase tiene que aguantar el extremo
        // corto aunque el Resumen pida 12.
        expect(portalPaymentsHint({ total: 20, portal: 8, share: 0.4 }, 1)).toBe(
            'De 20 pagos aprobados en el último mes',
        )
        expect(portalPaymentsHint({ total: 0, portal: 0, share: null }, 1)).toBe(
            'Sin pagos aprobados en el último mes',
        )
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
