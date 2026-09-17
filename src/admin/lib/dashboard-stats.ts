import { formatCalendarDate } from '@/lib/format'
import type {
    DebtBucket,
    DebtStats,
    IncomeStats,
    MembershipFlowStats,
    PaymentMethodsStats,
    RosterByCategoryStats,
    StatsCategory,
} from '../interfaces/AdminStats'

/*
 * Lo que la pantalla del Resumen hace con las cinco respuestas de
 * `/admin/stats/*`: rótulos, orden de pantalla y totales.
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
 * Una parte del total como porcentaje entero: "38%", "100%", y "—" cuando no
 * hay nada que repartir. El guion y no "0%": un cero se lee como un dato —el
 * portal no se usa— y no como la falta de dato que es.
 *
 * **Los extremos se reservan para los extremos de verdad.** Con 199 de 200,
 * `Math.round` da "100%" y el número afirma que por el mostrador no pasó nadie;
 * con 1 de 500 da "0%" y afirma que el portal no lo usó nadie. Es el único
 * redondeo que cambia lo que la frase DICE, así que se corta en 99% y 1% y la
 * tarjeta solo escribe 100% o 0% cuando del otro lado no quedó nada.
 */
export const percentLabel = (share: number | null): string => {
    if (share === null) return '—'

    const percent = share * 100
    const rounded = Math.round(percent)

    if (rounded === 100 && percent < 100) return '99%'
    if (rounded === 0 && percent > 0) return '1%'

    return `${rounded}%`
}

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
 * el viaje al socio, que es lo que mide este número. Lo que le cuesta trabajo
 * al club lo cuenta "Pagos pendientes", en la tarjeta de al lado.
 *
 * Si el backend suma un cuarto medio, cae del lado del mostrador hasta que
 * alguien lo agregue a esta lista: de los dos errores posibles es el seguro
 * —subestima el portal en vez de acreditarle un cobro presencial—.
 */
const PORTAL_METHODS: readonly string[] = ['TRANSFER', 'MERCADO_PAGO']

/**
 * Cuántos de los pagos del período entraron por el portal.
 *
 * **Cuenta pagos, no pesos**, al revés que la dona que esta tarjeta reemplazó
 * (`PaymentMethodsCard`, hasta el commit 6279dd3). Lo que mide el éxito del
 * producto es el trámite evitado —un pago hecho desde el teléfono es una
 * persona que no fue a la sede— y para eso los dos pagos valen igual. En pesos
 * el número contesta otra cosa: un solo atraso grande cobrado en el mostrador
 * hunde el porcentaje de un mes en el que casi todos pagaron solos.
 *
 * `share` es `null` y no 0 cuando el período no tuvo ningún pago aprobado. Ahí
 * no hay división posible, y un 0% sería una afirmación sobre el portal que el
 * dato no sostiene.
 */
export const portalPayments = ({ methods }: PaymentMethodsStats) => {
    const total = sum(methods.map((method) => method.payments))
    const portal = sum(
        methods
            .filter((method) => PORTAL_METHODS.includes(method.method))
            .map((method) => method.payments),
    )

    return { total, portal, share: total > 0 ? portal / total : null }
}

/**
 * El pie de la tarjeta del portal.
 *
 * Dice las dos cosas sin las que el porcentaje no significa nada: de qué
 * período habla —la fila de números que lo rodea habla toda de hoy— y sobre
 * cuántos pagos se calculó, porque un 38% de 12 pagos no es una tendencia y a
 * simple vista se lee igual que un 38% de 1.200.
 */
export const portalPaymentsHint = (
    { total, share }: ReturnType<typeof portalPayments>,
    months: number,
): string => {
    // El singular a mano: `months` es un parámetro y no el 12 escrito duro, así
    // que la frase tiene que aguantar la ventana más corta que acepta el
    // servidor (1). Sin esto, `portalPaymentsHint(summary, 1)` escribe "en los
    // últimos 1 meses" el día que alguien acorte el período.
    const period = months === 1 ? 'el último mes' : `los últimos ${months} meses`

    if (share === null) return `Sin pagos aprobados en ${period}`

    return `De ${countLabel(total, 'pago aprobado', 'pagos aprobados')} en ${period}`
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
