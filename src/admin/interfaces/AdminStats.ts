/**
 * Las respuestas de `GET /admin/stats/*`, una por tarjeta del Resumen.
 *
 * Tres garantías del contrato que el front NO rellena ni corrige:
 *
 * - Las series de meses vienen completas, en orden cronológico y con los meses
 *   en cero, terminando en el mes en curso del club.
 * - Las listas cerradas —los tres medios, las nueve categorías, las seis
 *   bandas, los cuatro tramos— vienen enteras aunque alguna esté en cero.
 * - Lo que no entra en un gráfico no desaparece: viene en un contador aparte
 *   (`noExpirationDate`, `withoutCategory`, `sexX`, `unknownSex`,
 *   `unknownBornDate`), y la pantalla lo muestra.
 */

/** Un mes del club, `YYYY-MM`. */
export type StatsMonth = string

/** `GET /admin/stats/income` */
export interface IncomeStats {
    months: {
        month: StatsMonth
        membership: number
        activity: number
        insurance: number
    }[]
}

export type StatsPaymentMethod = 'CASH' | 'TRANSFER' | 'MERCADO_PAGO'

/** `GET /admin/stats/payment-methods` */
export interface PaymentMethodsStats {
    /** La suma de `amount` de los tres medios. */
    total: number
    /** Siempre los tres, del cobro más manual al más automático. */
    methods: {
        method: StatsPaymentMethod
        amount: number
        /** Cantidad de pagos. */
        payments: number
    }[]
}

export type DebtBucket = 'UP_TO_1M' | 'FROM_1_TO_3M' | 'FROM_3_TO_6M' | 'OVER_6M'

/** `GET /admin/stats/debt` */
export interface DebtStats {
    /** Siempre los cuatro, del atraso más corto al más largo. */
    buckets: { bucket: DebtBucket; members: number }[]
    /** Socios sin vencimiento cargado: deben, pero no se sabe desde cuándo. */
    noExpirationDate: number
}

/**
 * Las nueve divisiones, con Reserva. No es `PlayerCategory` de `members`: ese
 * tipo es de otra feature y todavía no tiene `RESERVA`.
 */
export type StatsCategory =
    | 'RESERVA'
    | 'QUINTA'
    | 'SEXTA'
    | 'SEPTIMA'
    | 'OCTAVA'
    | 'NOVENA'
    | 'DECIMA'
    | 'PREDECIMA'
    | 'ESCUELITA'

/** `GET /admin/stats/roster-by-category` */
export interface RosterByCategoryStats {
    /** Siempre las nueve, en el orden del enum (de Reserva a Escuelita). */
    categories: {
        category: StatsCategory
        players: number
        activityUpToDate: number
    }[]
    /**
     * Jugadores sin categoría posible: sin fecha de nacimiento o por debajo de
     * la edad para jugar. No están en ninguna barra.
     */
    withoutCategory: number
}

export type AgeBand = '0-12' | '13-17' | '18-29' | '30-44' | '45-59' | '60+'

/** `GET /admin/stats/age-pyramid` */
export interface AgePyramidStats {
    /** Siempre las seis, de la más chica a la más grande. Solo sexo F y M. */
    bands: { band: AgeBand; female: number; male: number }[]
    /** Con fecha y sexo X: un valor declarado, no un dato que falta. */
    sexX: number
    /** Con fecha y sin el sexo cargado. */
    unknownSex: number
    /** Sin fecha de nacimiento, tengan o no el sexo. */
    unknownBornDate: number
}

/** `GET /admin/stats/membership-flow` */
export interface MembershipFlowStats {
    months: {
        month: StatsMonth
        joined: number
        left: number
    }[]
}
