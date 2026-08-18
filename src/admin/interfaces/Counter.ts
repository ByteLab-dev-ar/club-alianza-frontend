import type { PayableConcept, PaymentConcept } from '@/payments/interfaces/Payment'
import type { AdminMember } from './AdminMember'

/** Una transferencia esperando validación que cubre a esta persona. */
export interface PendingTransfer {
    concept: PaymentConcept
    month: string
}

/**
 * Una persona del mostrador: su ficha, qué se le puede cobrar y lo que ya tiene
 * pendiente.
 *
 * `payable` es **el mismo campo que arma `GET /payments/cart`** —mes, precio,
 * precio de lista, descuento y `requires`—, porque §5.10 dice que el mostrador
 * es el mismo carrito operado por tesorería. De ahí sale que el tesorero pueda
 * decir el importe ANTES de recibir la plata, y que la cadena de §5.3 no haya
 * que reimplementarla acá.
 *
 * Con **una diferencia que importa y que no hay que copiar del carrito: la
 * morosidad no filtra nada acá**. La app le vacía el carrito al moroso; el
 * mostrador le manda los precios igual, porque es el único camino que le queda
 * para regularizar. Un cartel de bloqueo en esta pantalla dejaría sin cobrar
 * justo a quien más necesita pagar.
 *
 * `notes` explica por qué algo que uno esperaría poder cobrar no aparece en
 * `payable`: todavía no es socio, le falta un concepto de la cadena, no está
 * marcado como jugador, o el club no cargó el monto. Son **aclaraciones, no
 * errores**.
 *
 * `pendingTransfers` casi siempre viene vacío. Cuando no, es la advertencia de
 * §5.10 y **hay que mostrarla antes de cobrar**: si el tesorero cobra igual, ese
 * comprobante queda rechazado automáticamente con el motivo "se cobró en la
 * sede". Sin el aviso, la familia que transfirió Y pagó en efectivo se entera
 * sola.
 */
export interface CounterPerson extends AdminMember {
    payable: PayableConcept[]
    notes: string[]
    pendingTransfers: PendingTransfer[]
}

export interface CounterChargePayload {
    /** Quién está parado en el mostrador. */
    payerProfileId: string
    items: { profileId: string; concepts: PaymentConcept[] }[]
    /**
     * Solo si difiere del calculado. Exige `amountReason`.
     *
     * §5.2 ya dice que cobrar atrasos es una conversación de mostrador. Lo que
     * **no cambia nunca** es qué cobertura otorga el pago: siempre el mes
     * corriente y nada más. La plata de más es plata que el club recibió, no un
     * saldo a favor ni meses adelantados.
     */
    amount?: number
    amountReason?: string
    paymentDate?: string
}

export interface CounterChargeResult {
    paymentId: string
    receiptNumber: number
    /** Con esto se dibuja el QR del recibo que la persona se lleva. */
    verificationCode: string
    total: number
    /**
     * Los comprobantes que este cobro dejó rechazados por pisarse. **Mostrarlos
     * es parte del flujo**: antes el rechazo pasaba en silencio.
     */
    rejectedPaymentIds: string[]
}

/** Una línea del recibo verificado. */
export interface VerifiedReceiptLine {
    memberName: string
    memberNumber: number | null
    concept: string
    month: string
    listAmount: number | null
    amount: number
}

/**
 * Lo que responde el código de verificación de un recibo.
 *
 * **Un recibo anulado responde `voided`, no "inválido"**: es un recibo real que
 * dejó de contar. El `404` queda para un código que no corresponde a ningún
 * recibo del club, que es el único caso que merece la palabra *inválido*.
 */
export interface VerifiedReceipt {
    /**
     * Con lo que se anula (`POST /admin/counter/receipts/{id}/void`, que
     * resuelve por UUID). Es la única respuesta que el tesorero tiene a mano
     * cuando alguien llega con el papel: lo único impreso es el código, y ni el
     * número ni el código sirven para anular.
     */
    id: string
    status: 'valid' | 'voided'
    number: number
    issuedAt: string
    /** Quién lo emitió: es lo que hace que el recibo sirva de respaldo. */
    issuedByName: string | null
    payerName: string
    payerMemberNumber: number | null
    total: number
    paidInCash: boolean
    voidedAt: string | null
    /** Quién lo anuló. Sin esto, quien escanea lee el motivo pero no de quién viene. */
    voidedByName: string | null
    voidReason: string | null
    detail: VerifiedReceiptLine[]
}

/**
 * El recibo que sale de una corrección (§5.10).
 *
 * Trae el `verificationCode` por el mismo motivo que el cobro del mostrador: la
 * persona se va con el papel nuevo, así que el QR hay que poder dibujarlo en el
 * acto y no en una segunda consulta.
 */
export interface ReissuedReceipt {
    id: string
    /** Sigue la numeración corrida: no reusa el número del anulado. */
    number: number
    verificationCode: string
}
