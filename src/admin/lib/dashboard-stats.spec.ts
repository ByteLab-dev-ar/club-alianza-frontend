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
    delinquentLine,
    incomeSummary,
    membershipFlowSummary,
    membershipLine,
    membershipSummary,
    methodLabel,
    monthTickLabel,
    orderCategoriesForDisplay,
    paymentChannelsLine,
    paymentChannelsSummary,
    percentText,
    periodLabel,
    rosterSummary,
    signed,
    twoPartPercents,
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
        expect(methodLabel('DEBITO_AUTOMATICO' as StatsPaymentMethod)).toBe('DEBITO_AUTOMATICO')
    })

    it('el medio se escribe como en el recibo y en Pagos', () => {
        // `PAYMENT_METHOD_LABELS` del backend.
        expect(methodLabel('CASH')).toBe('Efectivo')
        expect(methodLabel('MERCADO_PAGO')).toBe('Mercado Pago')
    })

    it('la ventana de un mes no dice "1 meses"', () => {
        expect(periodLabel(12)).toBe('los últimos 12 meses')
        expect(periodLabel(1)).toBe('el último mes')
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

describe('twoPartPercents', () => {
    it('redondea al entero', () => {
        expect(twoPartPercents(3, 5)).toEqual({ first: 38, second: 62 })
        expect(twoPartPercents(262, 188)).toEqual({ first: 58, second: 42 })
    })

    it('las dos partes suman 100 aunque redondeadas por separado no den', () => {
        // 1 de 8 es 12,5% y 7 de 8 es 87,5%: por separado, 13% + 88% = 101%.
        expect(twoPartPercents(1, 7)).toEqual({ first: 13, second: 87 })

        for (let first = 0; first <= 40; first++) {
            const percents = twoPartPercents(first, 40 - first)
            expect((percents?.first ?? 0) + (percents?.second ?? 0)).toBe(100)
        }
    })

    it('el 100% y el 0% solo salen cuando del otro lado no queda nada', () => {
        expect(twoPartPercents(8, 0)).toEqual({ first: 100, second: 0 })
        expect(twoPartPercents(0, 8)).toEqual({ first: 0, second: 100 })
    })

    it('no llega a los extremos por redondeo, de ninguno de los dos lados', () => {
        // 199 de 200 pagos por el portal: "100%" diría que por la sede no pasó
        // nadie, y pasó uno.
        expect(twoPartPercents(199, 1)).toEqual({ first: 99, second: 1 })
        // 1 de 500: "0%" diría que el portal no lo usó nadie.
        expect(twoPartPercents(1, 499)).toEqual({ first: 1, second: 99 })
    })

    it('sin nada que repartir no divide por cero ni inventa un 0%', () => {
        expect(twoPartPercents(0, 0)).toBeNull()
        expect(percentText(undefined)).toBe('—')
        expect(percentText(58)).toBe('58%')
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

describe('paymentChannelsSummary', () => {
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

    it('la transferencia y Mercado Pago son el portal; el efectivo es la sede', () => {
        const summary = paymentChannelsSummary(stats([30_000, 4], [20_000, 3], [10_000, 3]))

        expect(summary.portal).toEqual({ payments: 6, amount: 30_000 })
        expect(summary.sede).toEqual({ payments: 4, amount: 30_000 })
        expect(summary.payments).toBe(10)
        expect(summary.amount).toBe(60_000)
        expect(summary.percents).toEqual({ portal: 60, sede: 40 })
    })

    it('el portal va primero, y adentro de cada canal el orden del servidor', () => {
        const summary = paymentChannelsSummary(stats([1, 1], [1, 1], [1, 1]))

        expect(summary.rows.map((row) => [row.label, row.channel])).toEqual([
            ['Transferencia', 'portal'],
            ['Mercado Pago', 'portal'],
            ['Efectivo', 'sede'],
        ])
    })

    it('reparte pagos y no pesos: un atraso grande en la sede no hunde el portal', () => {
        // Nueve socios pagaron solos y uno vino a la sede a saldar un año.
        const summary = paymentChannelsSummary(stats([900_000, 1], [50_000, 4], [50_000, 5]))

        // En pesos el mismo período daría 10%, que contesta otra pregunta.
        expect(summary.percents).toEqual({ portal: 90, sede: 10 })
        expect(summary.maxPayments).toBe(5)
    })

    it('no redondea a 100% mientras quede un pago del otro lado', () => {
        const summary = paymentChannelsSummary(stats([5_000, 1], [0, 0], [600_000, 199]))

        expect(summary.percents).toEqual({ portal: 99, sede: 1 })
    })

    it('con 0 pagos no divide por cero: no hay porcentaje', () => {
        const summary = paymentChannelsSummary(stats([0, 0], [0, 0], [0, 0]))

        expect(summary.payments).toBe(0)
        expect(summary.percents).toBeNull()
        // Las tres barras se siguen dibujando: un medio sin pagos es el dato.
        expect(summary.rows).toHaveLength(3)
        expect(summary.maxPayments).toBe(0)

        // Y con la lista vacía, no solo con los tres medios en cero: el
        // contrato promete los tres, pero `sum([])` y `0 / 0` son la misma
        // trampa y acá no se paga.
        const empty = paymentChannelsSummary({ total: 0, methods: [] })
        expect(empty.percents).toBeNull()
        expect(empty.maxPayments).toBe(0)
    })

    it('con un solo canal da 100% y 0%, según cuál sea', () => {
        expect(paymentChannelsSummary(stats([0, 0], [0, 0], [8_000, 2])).percents).toEqual({
            portal: 100,
            sede: 0,
        })
        expect(paymentChannelsSummary(stats([8_000, 2], [0, 0], [0, 0])).percents).toEqual({
            portal: 0,
            sede: 100,
        })
    })

    it('un medio que el front todavía no conoce cuenta como sede y va al final', () => {
        // El enum del backend es varchar: si mañana aparece DEBITO_AUTOMATICO,
        // es mejor que el portal quede corto que inflado.
        const summary = paymentChannelsSummary({
            total: 20_000,
            methods: [
                { method: 'DEBITO_AUTOMATICO' as StatsPaymentMethod, amount: 10_000, payments: 1 },
                { method: 'TRANSFER' as StatsPaymentMethod, amount: 10_000, payments: 1 },
            ],
        })

        expect(summary.portal.payments).toBe(1)
        expect(summary.sede.payments).toBe(1)
        expect(summary.rows.map((row) => row.label)).toEqual(['Transferencia', 'DEBITO_AUTOMATICO'])
    })
})

describe('paymentChannelsLine', () => {
    const line = (portal: number, sede: number, months = 12) =>
        paymentChannelsLine(
            paymentChannelsSummary({
                total: 0,
                methods: [
                    { method: 'CASH', amount: 0, payments: sede },
                    { method: 'TRANSFER', amount: 0, payments: portal },
                ],
            }),
            months,
        )

    it('dice el reparto, sobre cuántos pagos y en qué período', () => {
        expect(line(91, 149)).toBe(
            'De 240 pagos aprobados en los últimos 12 meses, el 38% entró por el portal y el 62% se cobró en la sede.',
        )
    })

    it('con un solo pago no escribe "1 pagos"', () => {
        expect(line(1, 0)).toBe(
            'De 1 pago aprobado en los últimos 12 meses, el 100% entró por el portal y el 0% se cobró en la sede.',
        )
    })

    it('sin pagos explica por qué no hay porcentaje', () => {
        expect(line(0, 0)).toBe('Sin pagos aprobados en los últimos 12 meses.')
        // El servidor acepta de 1 a 24: la frase aguanta el extremo corto.
        expect(line(0, 0, 1)).toBe('Sin pagos aprobados en el último mes.')
    })
})

describe('membershipSummary', () => {
    it('las vencidas son el resto del padrón', () => {
        expect(membershipSummary({ activeMembers: 262, totalMembers: 450 })).toEqual({
            total: 450,
            active: 262,
            expired: 188,
            percents: { active: 58, expired: 42 },
        })
    })

    it('no redondea a 100% mientras quede alguien con la membresía vencida', () => {
        expect(membershipSummary({ activeMembers: 449, totalMembers: 450 }).percents).toEqual({
            active: 99,
            expired: 1,
        })
        expect(membershipSummary({ activeMembers: 450, totalMembers: 450 }).percents).toEqual({
            active: 100,
            expired: 0,
        })
    })

    it('con nadie vigente da 0%, que es un dato y no la falta de uno', () => {
        expect(membershipSummary({ activeMembers: 0, totalMembers: 30 }).percents).toEqual({
            active: 0,
            expired: 100,
        })
    })

    it('con el padrón vacío no divide por cero', () => {
        expect(membershipSummary({ activeMembers: 0, totalMembers: 0 })).toEqual({
            total: 0,
            active: 0,
            expired: 0,
            percents: null,
        })
    })

    it('si el alta entró entre los dos conteos, las vencidas no salen negativas', () => {
        // Los dos COUNT del backend no comparten foto: puede llegar 451 de 450.
        const summary = membershipSummary({ activeMembers: 451, totalMembers: 450 })

        expect(summary.active).toBe(450)
        expect(summary.expired).toBe(0)
        expect(summary.percents).toEqual({ active: 100, expired: 0 })
    })
})

describe('membershipLine', () => {
    const summary = membershipSummary({ activeMembers: 262, totalMembers: 450 })

    it('dice el padrón y, cuando el conteo respondió, los morosos marcados', () => {
        expect(membershipLine(summary, 31)).toBe(
            '450 socios en el padrón. 31 marcados como morosos: pagan en la sede, salvo con chicos a cargo.',
        )
    })

    it('mientras el conteo carga, solo el padrón', () => {
        expect(membershipLine(summary, undefined)).toBe('450 socios en el padrón.')
    })

    it('si el conteo falló lo dice, en vez de parecer un padrón sin morosos', () => {
        expect(membershipLine(summary, null)).toBe(
            '450 socios en el padrón. No pudimos cargar cuántos están marcados como morosos.',
        )
    })

    it('con el padrón vacío no habla de morosos', () => {
        expect(membershipLine(membershipSummary({ activeMembers: 0, totalMembers: 0 }), 0)).toBe(
            'Todavía no hay socios en el padrón.',
        )
    })
})

describe('delinquentLine', () => {
    it('en singular, en plural y en cero', () => {
        expect(delinquentLine(1)).toBe('1 marcado como moroso: paga en la sede, salvo con chicos a cargo.')
        expect(delinquentLine(3)).toBe(
            '3 marcados como morosos: pagan en la sede, salvo con chicos a cargo.',
        )
        expect(delinquentLine(0)).toBe('Nadie marcado como moroso.')
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
