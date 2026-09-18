import { formatCalendarDate } from '@/lib/format'
import type {
    DebtBucket,
    DebtStats,
    IncomeStats,
    MembershipFlowStats,
    PaymentMethodsStats,
    RosterByCategoryStats,
    StatsCategory,
    StatsPaymentMethod,
} from '../interfaces/AdminStats'
import type { DashboardSummary } from '../interfaces/DashboardSummary'

/*
 * Lo que la pantalla del Resumen hace con los datos de sus seis gráficos —las
 * cinco respuestas de `/admin/stats/*` y el padrón de `/admin/dashboard`—:
 * rótulos, orden de pantalla, totales y repartos.
 *
 * Lo que NO hace, a propósito: rellenar meses, categorías o tramos (el servidor
 * las manda completas), ni comparar los ingresos con la tarjeta "Ingresos del
 * mes". Esas dos cifras pueden no coincidir y está decidido así —el gráfico
 * suma las líneas por concepto y la tarjeta lo cobrado—; cuadrarlas acá sería
 * inventar a qué concepto pertenece la diferencia.
 */

// ----------------------------------------------------------------- rótulos

/**
 * Cómo se escribe cada categoría. **Es copia de `PLAYER_CATEGORY_LABELS` del
 * backend**, y es una excepción que hay que retirar.
 *
 * La regla del repo es que la nomenclatura del club viaja calculada desde el
 * servidor (`playerCategoryLabel`), para que el mismo chico no salga con dos
 * nombres entre la ficha, el padrón y la credencial. `roster-by-category` solo
 * devuelve el enum, así que por ahora la tabla va acá, con los textos EXACTOS
 * del servidor ("7ma", no "Séptima"). Cuando el endpoint traiga el rótulo, esto
 * se borra.
 */
const CATEGORY_LABELS: Record<StatsCategory, string> = {
    RESERVA: 'Reserva',
    QUINTA: '5ta',
    SEXTA: '6ta',
    SEPTIMA: '7ma',
    OCTAVA: '8va',
    NOVENA: '9na',
    DECIMA: '10ma',
    PREDECIMA: 'Predécima',
    ESCUELITA: 'Escuelita',
}

/**
 * Cómo se escribe cada medio. Misma excepción que las categorías: copia de
 * `PAYMENT_METHOD_LABELS` del backend, porque `payment-methods` no trae el
 * `methodLabel` que sí traen los pagos. Tienen que decir lo mismo que la
 * columna "Medio" de Pagos y que el recibo, o tesorería concilia dos nombres.
 */
const METHOD_LABELS: Record<StatsPaymentMethod, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    MERCADO_PAGO: 'Mercado Pago',
}

/** Copy de esta pantalla, no nomenclatura del club: estos sí son del front. */
const BUCKET_LABELS: Record<DebtBucket, string> = {
    UP_TO_1M: 'Hasta 1 mes',
    FROM_1_TO_3M: '1 a 3 meses',
    FROM_3_TO_6M: '3 a 6 meses',
    OVER_6M: 'Más de 6 meses',
}

/*
 * Los rótulos toleran un valor que el tipo no conoce y lo muestran crudo: si el
 * servidor suma una categoría o un tramo antes que el front, la fila tiene que
 * aparecer con su nombre de enum y no desaparecer ni romper el render.
 */
const labelFrom = <K extends string>(labels: Record<K, string>, key: string): string =>
    (labels as Record<string, string | undefined>)[key] ?? key

export const categoryLabel = (category: StatsCategory) => labelFrom(CATEGORY_LABELS, category)
export const methodLabel = (method: StatsPaymentMethod) => labelFrom(METHOD_LABELS, method)
export const bucketLabel = (bucket: DebtBucket) => labelFrom(BUCKET_LABELS, bucket)

/**
 * El rótulo de un mes en el eje: "oct", y "ene 26" en enero. El año aparece
 * solo donde cambia; en los doce rótulos seguidos ensucia sin decir nada.
 */
export const monthTickLabel = (month: string): string =>
    month.endsWith('-01')
        ? formatCalendarDate(`${month}-01`, 'MMM yy')
        : formatCalendarDate(`${month}-01`, 'MMM')

/** El mes entero, para el tooltip y la tabla: "oct 2025". */
export const monthLabel = (month: string): string => formatCalendarDate(`${month}-01`, 'MMM yyyy')

/** "1 socio", "3 socios", "0 socios". */
export const countLabel = (count: number, singular: string, plural: string): string =>
    `${count} ${count === 1 ? singular : plural}`

/** El neto con signo: "+3", "-2", "0". */
export const signed = (value: number): string => (value > 0 ? `+${value}` : String(value))

/**
 * Un total partido en dos, como porcentajes enteros que SUMAN 100: el padrón
 * entre membresía vigente y vencida, y los pagos entre el portal y la sede.
 *
 * **Se redondea una sola parte y la otra es lo que falta hasta 100.**
 * Redondeadas por separado, 1 de 8 da 13% y 7 de 8 da 88%: 101% en una barra
 * que es el total, y quien suma la tabla deja de creerle al resto.
 *
 * **Los extremos se reservan para los extremos de verdad.** Con 199 de 200,
 * `Math.round` da 100% y la frase afirma que por la sede no pasó nadie; con 1
 * de 500 da 0% y afirma que el portal no lo usó nadie. Es el único redondeo que
 * cambia lo que la frase DICE, así que mientras quede algo del otro lado la
 * parte se corta en 99% o en 1% —y la otra, que es el complemento, tampoco
 * llega a 0% ni a 100%—.
 *
 * `null` y no dos ceros cuando no hay nada que repartir: 0 de 0 no tiene
 * división, y un 0% se lee como un dato —el portal no se usa— y no como la
 * falta de dato que es. La pantalla escribe un guion.
 */
export const twoPartPercents = (first: number, second: number): { first: number; second: number } | null => {
    const total = first + second

    if (!(total > 0)) return null

    const rounded = Math.round((first / total) * 100)
    const clamped = rounded === 100 && second > 0 ? 99 : rounded === 0 && first > 0 ? 1 : rounded

    return { first: clamped, second: 100 - clamped }
}

/** "58%", o el guion cuando no hubo nada que repartir (ver `twoPartPercents`). */
export const percentText = (percent: number | undefined): string =>
    percent === undefined ? '—' : `${percent}%`

/**
 * "los últimos 12 meses", y "el último mes" con la ventana de uno: `months` es
 * un parámetro y no el 12 escrito duro, y el servidor acepta de 1 a 24. Sin el
 * singular a mano, el día que alguien acorte el período la frase dice "en los
 * últimos 1 meses".
 */
export const periodLabel = (months: number): string =>
    months === 1 ? 'el último mes' : `los últimos ${months} meses`

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

// ---------------------------------------------------------------- ingresos

export const incomeSummary = ({ months }: IncomeStats) => {
    const rows = months.map((month) => ({
        ...month,
        total: month.membership + month.activity + month.insurance,
    }))

    return {
        rows,
        membership: sum(rows.map((row) => row.membership)),
        activity: sum(rows.map((row) => row.activity)),
        insurance: sum(rows.map((row) => row.insurance)),
        total: sum(rows.map((row) => row.total)),
        max: Math.max(0, ...rows.map((row) => row.total)),
    }
}

// ---------------------------------------------------------- medios de pago

/**
 * Los medios que el socio resuelve SOLO, sin pisar la sede.
 *
 * El reparto no lo elige esta pantalla, lo hace el backend: el mostrador graba
 * `CASH` y nada más (`counter.service.ts` fija el medio, no lo recibe), y
 * `TRANSFER` y `MERCADO_PAGO` solo pueden nacer en `POST /payments/cart`, que
 * corre a nombre del socio logueado y no acepta otro medio
 * (`CreateCartPaymentDto`). No hay camino por el que el personal registre uno
 * de esos dos por él. Así que "no fue efectivo" equivale exactamente a "no vino
 * a la sede", que es el trámite que PRODUCT.md cuenta como evitado.
 *
 * Que la transferencia la apruebe tesorería a mano no la saca de acá: le ahorra
 * el viaje al socio, que es lo que mide este reparto. Lo que le cuesta trabajo
 * al club lo cuenta la tarjeta "Transferencias por revisar".
 *
 * Si el backend suma un cuarto medio, cae del lado de la sede hasta que alguien
 * lo agregue a esta lista: de los dos errores posibles es el seguro
 * —subestima el portal en vez de acreditarle un cobro presencial—.
 */
const PORTAL_METHODS: readonly string[] = ['TRANSFER', 'MERCADO_PAGO']

export type PaymentChannel = 'portal' | 'sede'

const CHANNEL_LABELS: Record<PaymentChannel, string> = {
    portal: 'Por el portal',
    sede: 'En la sede',
}

export const channelLabel = (channel: PaymentChannel) => CHANNEL_LABELS[channel]

/**
 * Los medios de pago agrupados por CANAL: lo que el socio paga solo contra lo
 * que se cobra en la sede. Es lo que dibuja "Por dónde entra la plata".
 *
 * **El reparto cuenta pagos, no pesos.** Lo que mide el éxito del producto es
 * el trámite evitado (PRODUCT.md) —un pago hecho desde el teléfono es una
 * persona que no fue a la sede— y para eso los dos pagos valen igual. En pesos
 * contesta otra cosa: un solo atraso grande cobrado en el mostrador hunde el
 * porcentaje de un mes en el que casi todos pagaron solos. Los importes viajan
 * igual, para la columna "Cobrado" y la tabla, pero no reparten.
 *
 * Las filas van con el portal PRIMERO, y adentro de cada canal en el orden del
 * servidor: juntas, las dos barras del portal se leen como un bloque contra la
 * de la sede, que es la comparación que el gráfico existe para mostrar. Un
 * medio que el front no conoce cae del lado de la sede y va al final (ver
 * `PORTAL_METHODS`), con su nombre de enum.
 *
 * `percents` es `null` cuando el período no tuvo ningún pago aprobado, por lo
 * que explica `twoPartPercents`.
 */
export const paymentChannelsSummary = ({ methods }: PaymentMethodsStats) => {
    const withChannel = methods.map((method) => ({
        ...method,
        label: methodLabel(method.method),
        channel: (PORTAL_METHODS.includes(method.method) ? 'portal' : 'sede') as PaymentChannel,
    }))
    const rows = [
        ...withChannel.filter((row) => row.channel === 'portal'),
        ...withChannel.filter((row) => row.channel === 'sede'),
    ]

    const totals = (channel: PaymentChannel) => {
        const inChannel = rows.filter((row) => row.channel === channel)
        return {
            payments: sum(inChannel.map((row) => row.payments)),
            amount: sum(inChannel.map((row) => row.amount)),
        }
    }
    const portal = totals('portal')
    const sede = totals('sede')
    const percents = twoPartPercents(portal.payments, sede.payments)

    return {
        rows,
        portal,
        sede,
        payments: portal.payments + sede.payments,
        amount: portal.amount + sede.amount,
        percents: percents && { portal: percents.first, sede: percents.second },
        maxPayments: Math.max(0, ...rows.map((row) => row.payments)),
    }
}

/**
 * El pie de "Por dónde entra la plata": el reparto, sobre cuántos pagos y en
 * qué período.
 *
 * El porcentaje del portal es la vara de PRODUCT.md, así que va en palabras y
 * no solo en el largo de las barras. Y lleva al lado las dos cosas sin las que
 * no significa nada: el período —el resto del Resumen habla de hoy o de este
 * mes— y la base, porque un 38% de 12 pagos no es una tendencia y a simple
 * vista se lee igual que un 38% de 1.200.
 */
export const paymentChannelsLine = (
    { payments, percents }: ReturnType<typeof paymentChannelsSummary>,
    months: number,
): string => {
    const period = periodLabel(months)

    if (percents === null) return `Sin pagos aprobados en ${period}.`

    return (
        `De ${countLabel(payments, 'pago aprobado', 'pagos aprobados')} en ${period}, ` +
        `el ${percents.portal}% entró por el portal y el ${percents.sede}% se cobró en la sede.`
    )
}

// --------------------------------------------------------------- membresía

/**
 * El padrón partido por la membresía, para el gráfico de Membresía.
 *
 * Sale de `/admin/dashboard`, el mismo pedido que la tarjeta "Total de socios":
 * el total del gráfico y el de la tarjeta son el mismo número y no pueden
 * contradecirse. "Vencidas" es el resto del padrón y cuenta también a quien no
 * tiene ningún vencimiento cargado, igual que la solapa "Vencidos" de Socios
 * (`expired` en `/admin/members/counts`).
 *
 * El backend saca los dos números con dos `COUNT` en paralelo, sin una foto
 * común: un alta con la membresía vigente que entra entre uno y otro deja
 * `activeMembers` uno por arriba de `totalMembers`. Se recorta para que las
 * vencidas no salgan negativas y la barra no pase del 100%.
 */
export const membershipSummary = ({
    activeMembers,
    totalMembers,
}: Pick<DashboardSummary, 'activeMembers' | 'totalMembers'>) => {
    const total = Math.max(totalMembers, 0)
    const active = Math.min(Math.max(activeMembers, 0), total)
    const expired = total - active
    const percents = twoPartPercents(active, expired)

    return {
        total,
        active,
        expired,
        percents: percents && { active: percents.first, expired: percents.second },
    }
}

/**
 * Los morosos marcados, en palabras: van en el pie del gráfico de Membresía y
 * no como un tramo de la barra (el porqué, en `MembershipCard`).
 *
 * `null` es que el conteo falló. Lo dice en vez de callarse, porque un pie sin
 * la frase de los morosos se lee igual que uno de un padrón sin morosos.
 *
 * El "pagan en la sede, salvo con chicos a cargo" es lo que la marca le hace
 * al socio: el portal no lo deja pagar y lo manda a la sede, salvo que tenga
 * personas a cargo (§5.8, `CartService.isBlockedByDelinquency` en el backend).
 */
export const delinquentLine = (delinquent: number | null): string => {
    if (delinquent === null) return 'No pudimos cargar cuántos están marcados como morosos.'
    if (delinquent === 0) return 'Nadie marcado como moroso.'

    return delinquent === 1
        ? '1 marcado como moroso: paga en la sede, salvo con chicos a cargo.'
        : `${delinquent} marcados como morosos: pagan en la sede, salvo con chicos a cargo.`
}

/**
 * El pie del gráfico de Membresía: el padrón y, cuando el conteo ya respondió,
 * los morosos. `undefined` es que todavía no llegó: la frase aparece sola al
 * final, y un "cargando" en letra chica para un número secundario sería ruido.
 *
 * Con el padrón vacío lo dice y no habla de morosos: un "Nadie marcado como
 * moroso" abajo de un padrón sin nadie no agrega nada.
 */
export const membershipLine = (
    { total }: ReturnType<typeof membershipSummary>,
    delinquent: number | null | undefined,
): string => {
    if (total === 0) return 'Todavía no hay socios en el padrón.'

    const padron = `${countLabel(total, 'socio', 'socios')} en el padrón.`

    return delinquent === undefined ? padron : `${padron} ${delinquentLine(delinquent)}`
}

// ------------------------------------------------------------------- deuda

/** Los tramos que pasaron los tres meses, que es el corte de la marca de moroso. */
const PAST_DELINQUENCY_THRESHOLD: readonly string[] = ['FROM_3_TO_6M', 'OVER_6M']

export const debtSummary = ({ buckets, noExpirationDate }: DebtStats) => {
    const rows = buckets.map((bucket) => ({ ...bucket, label: bucketLabel(bucket.bucket) }))
    const inBuckets = sum(rows.map((row) => row.members))

    return {
        rows,
        inBuckets,
        /**
         * Los que cumplen el CRITERIO de moroso, no los marcados: la marca
         * además deja afuera al personal y corre de noche con un tope diario.
         */
        pastThreshold: sum(
            rows.filter((row) => PAST_DELINQUENCY_THRESHOLD.includes(row.bucket)).map((row) => row.members),
        ),
        /** No están en ningún tramo: meterlos en uno sería inventar desde cuándo deben. */
        noExpirationDate,
        total: inBuckets + noExpirationDate,
        max: Math.max(0, ...rows.map((row) => row.members)),
    }
}

// ----------------------------------------------------------------- plantel

/**
 * El orden de pantalla: de la Escuelita a Reserva, de abajo hacia arriba en la
 * escala del club, como lo dibuja la maqueta. El servidor las manda en el
 * orden del enum, que es el inverso.
 */
const CATEGORY_DISPLAY_ORDER: readonly string[] = [
    'ESCUELITA',
    'PREDECIMA',
    'DECIMA',
    'NOVENA',
    'OCTAVA',
    'SEPTIMA',
    'SEXTA',
    'QUINTA',
    'RESERVA',
]

/**
 * Las categorías en el orden de pantalla, **sin sacar ninguna**. Se ordena lo
 * que llegó en vez de recorrer la lista de acá y buscar cada una: así una
 * categoría que el front todavía no conoce queda al final en lugar de
 * desaparecer, y una vacía se sigue dibujando, porque una categoría sin nadie
 * es el dato.
 */
export const orderCategoriesForDisplay = <T extends { category: string }>(categories: T[]): T[] => {
    const rank = (category: string) => {
        const index = CATEGORY_DISPLAY_ORDER.indexOf(category)
        return index === -1 ? CATEGORY_DISPLAY_ORDER.length : index
    }

    return [...categories].sort((a, b) => rank(a.category) - rank(b.category))
}

export const rosterSummary = ({ categories, withoutCategory }: RosterByCategoryStats) => {
    const rows = orderCategoriesForDisplay(categories).map((category) => ({
        ...category,
        label: categoryLabel(category.category),
        notUpToDate: category.players - category.activityUpToDate,
    }))
    const players = sum(rows.map((row) => row.players))
    const upToDate = sum(rows.map((row) => row.activityUpToDate))

    return {
        rows,
        players,
        upToDate,
        notUpToDate: players - upToDate,
        /** Marcados como jugadores y sin categoría posible: no están en ninguna barra. */
        withoutCategory,
        total: players + withoutCategory,
        max: Math.max(0, ...rows.map((row) => row.players)),
    }
}

// ---------------------------------------------------------- altas y bajas

export const membershipFlowSummary = ({ months }: MembershipFlowStats) => {
    const rows = months.map((month) => ({ ...month, net: month.joined - month.left }))
    const joined = sum(rows.map((row) => row.joined))
    const left = sum(rows.map((row) => row.left))

    return {
        rows,
        joined,
        left,
        net: joined - left,
        maxJoined: Math.max(0, ...rows.map((row) => row.joined)),
        maxLeft: Math.max(0, ...rows.map((row) => row.left)),
    }
}
