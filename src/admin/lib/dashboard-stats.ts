import { formatCalendarDate } from '@/lib/format'
import type {
    DebtBucket,
    DebtStats,
    IncomeStats,
    MembershipFlowStats,
    RosterByCategoryStats,
    StatsCategory,
} from '../interfaces/AdminStats'

/*
 * Lo que la pantalla del Resumen hace con las cuatro respuestas de
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
