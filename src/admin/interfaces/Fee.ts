import type { PaymentConcept } from '@/payments/interfaces/Payment'

/**
 * Una vigencia de precio: desde qué mes rige un concepto y cuánto sale.
 *
 * Vale hasta que aparece otra más nueva. **Un cambio rige desde el mes
 * siguiente y nunca toca el mes en curso** — esa sola regla resuelve la
 * retroactividad entera: un recibo ya emitido jamás cambia de importe, y cada
 * mes conserva el precio que tenía cuando se generó.
 */
export interface Fee {
    id: string
    concept: PaymentConcept
    /** Mes desde el que rige, YYYY-MM. */
    effectiveFrom: string
    amount: number
    /**
     * Si todavía no empezó a regir. Es lo único que hace falta para saber si
     * ofrecer editar y borrar: **un precio que ya rige es historia y no se toca
     * jamás**, porque los recibos emitidos con él tienen que seguir diciendo lo
     * mismo dentro de diez años.
     */
    isEditable: boolean
    /** Quién lo dejó así. `null` si esa cuenta se borró. */
    setByName: string | null
    createdAt: string
}

/**
 * Lo que rige HOY, por concepto.
 *
 * `null` significa que **el club todavía no cargó ese precio**, que no es lo
 * mismo que cero: sin monto cargado no se puede cobrar ese concepto, y el
 * carrito se queda sin ofrecerlo. Es un estado de alerta, no un dato vacío.
 */
export type CurrentFees = Record<PaymentConcept, number | null>

export interface CreateFeePayload {
    concept: PaymentConcept
    effectiveFrom: string
    amount: number
}
