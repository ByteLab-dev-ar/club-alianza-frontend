/** Una fila del recibo, congelada como se emitió. */
export interface ReceiptDetailLine {
    memberName: string
    memberNumber: number | null
    /** Ya viene escrito como lo imprimió el club. No se re-traduce acá. */
    concept: string
    month: string
    /** El precio de lista. La diferencia contra `amount` es lo que se descontó. */
    listAmount: number | null
    amount: number
}

/**
 * El recibo que emitió el club (§5.10).
 *
 * > Se genera una sola vez y se guarda. Un recibo cuyo contenido cambia cuando
 * > el socio edita su domicilio no es un recibo: es una consulta.
 *
 * Todo lo de acá viene de la fila de `receipts`, no de joinear el perfil: el
 * papel que la persona tiene en la mano no cambia porque alguien haya corregido
 * un dato después. **Nada se recalcula en el cliente** — el impreso y esta
 * pantalla tienen que decir lo mismo dentro de diez años.
 */
export interface Receipt {
    /**
     * El UUID del recibo, por el que resuelve la anulación
     * (`POST /admin/counter/receipts/{id}/void`). El número y el código no
     * sirven para eso.
     */
    id: string
    /** Corrido y sin huecos. Es lo que lo identifica ante el club. */
    number: number
    /**
     * Lo que va adentro del QR. **Nunca se le dice "firma"**: la ley 25.506
     * reserva ese término para otra cosa. Es un código de verificación.
     */
    verificationCode: string
    issuedAt: string
    /** Quién lo emitió. Es lo que hace que el recibo sirva de respaldo. */
    issuedByName: string | null
    payerName: string
    payerMemberNumber: number | null
    total: number
    /** Si se cobró en la sede o entró por transferencia. */
    paidInCash: boolean
    /**
     * `voided` es un recibo REAL que dejó de contar, no una falsificación. En
     * pantalla se escribe **anulado**: "inválido" suena a falsificación, y la
     * diferencia le importa a quien lo tiene en la mano.
     */
    status: 'valid' | 'voided'
    voidedAt: string | null
    /**
     * Quién lo anuló. §5.10 pide las dos mitades —cuándo y quién—, y sin esto
     * el socio que abre su recibo leía el motivo pero no de quién venía la
     * decisión, mientras que el empleado que escaneaba el mismo papel sí lo
     * veía. Es el mismo campo que devuelve `verify/{code}`.
     */
    voidedByName: string | null
    voidReason: string | null
    detail: ReceiptDetailLine[]
}
