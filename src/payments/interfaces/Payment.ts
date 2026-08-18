/**
 * Los tres estados que existen. Había un cuarto, REFUNDED ("Reintegrado"), que
 * se eliminó del sistema: el backend ya no lo devuelve ni lo acepta como filtro.
 */
export const PaymentStatuses = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const

export type PaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
}

/**
 * Los tres conceptos de la cuota.
 *
 * Reemplazan al viejo `type: 'MEMBERSHIP'`, que tenía un solo valor. No son
 * partes de un pago único: son tres coberturas independientes, cada una con su
 * vencimiento. Un socio con la membresía al día y la actividad vencida es un
 * estado normal, no una inconsistencia.
 */
export const PaymentConcepts = {
    /** Pertenecer al club. La paga todo socio y es la única que bloquea el ingreso. */
    MEMBERSHIP: 'MEMBERSHIP',
    /** Entrenar y jugar. Solo el jugador. Vencida, entra igual a ver los partidos. */
    ACTIVITY: 'ACTIVITY',
    /** Cobertura médica de la actividad. Opcional de verdad: no bloquea nada. */
    INSURANCE: 'INSURANCE',
} as const

export type PaymentConcept = (typeof PaymentConcepts)[keyof typeof PaymentConcepts]

export const PAYMENT_CONCEPT_LABELS: Record<PaymentConcept, string> = {
    MEMBERSHIP: 'Membresía',
    ACTIVITY: 'Actividad',
    INSURANCE: 'Seguro',
}

/**
 * El concepto como lo lee una persona, tolerando un valor cualquiera.
 *
 * Toma `string` y no `PaymentConcept` porque el **recibo viene congelado**: su
 * detalle es un jsonb que se guardó el día de la emisión, así que el tipo real
 * de lo que llega es "lo que había entonces", no el enum de hoy. El recibo y la
 * verificación del QR lo pintaban crudo y el socio leía `MEMBERSHIP` en un
 * comprobante del club.
 *
 * La caída devuelve el valor tal cual: en un recibo de diez años atrás es
 * preferible mostrar el código que un guion.
 */
export const paymentConceptLabel = (concept: string): string =>
    PAYMENT_CONCEPT_LABELS[concept as PaymentConcept] ?? concept

/**
 * Una línea del pago: a quién cubre, de qué y de qué mes. Es la fila del recibo.
 */
export interface PaymentLine {
    profileId: string
    /** Nombre ya armado por el servidor, ej. "Tomás Gómez". */
    memberName: string
    memberNumber: number | null
    concept: PaymentConcept
    /** Mes de la cobertura, formato YYYY-MM. */
    month: string
    /** Lo que se cobró, con el descuento ya aplicado. */
    amount: number
    /** Precio de lista. La diferencia contra `amount` ES el descuento. */
    listAmount: number | null
}

/**
 * Lo mínimo del recibo del club que viaja en el LISTADO de pagos.
 *
 * Alcanza para poner el botón "ver recibo" y dibujar el QR sin una consulta por
 * fila; el detalle completo se pide aparte, a `/payments/{id}/receipt-document`.
 */
export interface PaymentReceiptSummary {
    /**
     * El UUID del recibo, por el que resuelve la anulación del panel. Viaja en
     * el listado para no tener que pedir el detalle solo para conseguirlo.
     */
    id: string
    /** Corrido y sin huecos. Es lo que identifica al recibo ante el club. */
    number: number
    /** Lo que va adentro del QR. Nunca se le dice "firma" (§5.10). */
    verificationCode: string
    /**
     * `voided` es un recibo REAL que dejó de contar, no una falsificación: en
     * pantalla se escribe **anulado**, nunca "inválido".
     */
    status: 'valid' | 'voided'
}

/** `PaymentResponseDto`: la vista del propio socio (sin quién lo validó). */
export interface Payment {
    id: string
    /** El TOTAL de la operación: la suma de las líneas. */
    amount: number
    paymentDate: string
    /**
     * Qué cubre este pago, detallado.
     *
     * Reemplaza a `concept` y `metadataMonth`, que vivían acá cuando un pago era
     * de una persona y un mes. Con el carrito, un pago cubre a varios socios con
     * varios conceptos: preguntarle al pago "de qué es" dejó de tener una
     * respuesta única.
     *
     * Para el flujo de siempre —el socio pagando su propia membresía— viene una
     * sola línea. Un pago que no es de cuota viene **sin ninguna**, así que todo
     * lo que lea de acá tiene que bancarse el array vacío.
     */
    lines: PaymentLine[]
    /**
     * La ruta del COMPROBANTE que subió quien pagó —la foto de la
     * transferencia—, no del recibo del club.
     *
     * Los dos se llaman parecido y conviene no mezclarlos: este es lo que la
     * persona entregó; `receipt`, lo que el club emitió. Un pago rechazado
     * pierde este archivo (§4) y nunca tuvo el otro.
     */
    receiptUrl: string | null
    /** El recibo que emitió el club, o `null` si el pago todavía no se aprobó. */
    receipt: PaymentReceiptSummary | null
    status: PaymentStatus
    validatedAt: string | null
    rejectionReason: string | null
    createdAt: string
}

/**
 * Cómo se resume un pago de varias líneas en una celda de tabla.
 *
 * Con una sola línea —el caso de siempre, el socio pagando lo suyo— devuelve su
 * valor tal cual y la tabla se ve igual que antes. Con varias, una familia
 * pagando junta, no se puede elegir una sin mentir sobre el resto, así que se
 * cuentan. Sin líneas devuelve null, que las tablas ya muestran como "—".
 */
const summarize = (values: string[], plural: string): string | null => {
    const [first, ...rest] = [...new Set(values)]
    // `first` desestructurado y no `unique[0]`: con noUncheckedIndexedAccess, el
    // índice devuelve `string | undefined` aunque el largo ya esté chequeado.
    if (first === undefined) return null
    if (rest.length === 0) return first
    return `${rest.length + 1} ${plural}`
}

/** Qué conceptos cubre el pago, para mostrar en una celda. */
export const summarizeConcepts = (payment: Payment): string | null =>
    summarize(
        payment.lines.map((line) => PAYMENT_CONCEPT_LABELS[line.concept]),
        'conceptos',
    )

/**
 * Qué meses cubre el pago. Con uno solo devuelve el `YYYY-MM` crudo, así la
 * pantalla lo formatea como venía haciéndolo; con varios ya viene resumido.
 */
export const summarizeMonths = (payment: Payment): string | null =>
    summarize(
        payment.lines.map((line) => line.month),
        'meses',
    )

/* ---- El carrito ---- */

/** Un concepto que se le puede pagar a una persona, con su mes y su precio. */
export interface PayableConcept {
    concept: PaymentConcept
    /** Mes que corresponde, decidido por el servidor. */
    month: string
    /** Lo que se cobra, con el descuento ya aplicado. */
    amount: number
    /** El precio antes del descuento. */
    listAmount: number
    /** Si salió con el 50% del grupo familiar. */
    hasFamilyDiscount: boolean
    /**
     * Qué otros conceptos de ESTA misma persona tienen que viajar en el mismo
     * pago para que valga.
     *
     * La cadena de §5.3 se evalúa sobre cómo queda la persona **después** del
     * pago, no sobre cómo estaba antes. Por eso al jugador que arranca el mes
     * sin nada pago se le ofrece la actividad con precio y con `requires:
     * ['MEMBERSHIP']`: las dos entran en una sola operación, que es todo el
     * punto — la alternativa era pagar la membresía, esperar a que tesorería
     * validara la transferencia y volver a entrar. Dos viajes, todos los meses.
     *
     * Vacío cuando el concepto se puede pagar suelto. Sin mirarlo, la pantalla
     * manda la actividad sola y se come un 422.
     */
    requires: PaymentConcept[]
}

/** Una persona a la que esta cuenta le puede pagar: el titular o alguien a cargo. */
export interface CartPerson {
    profileId: string
    name: string
    memberNumber: number | null
    isSelf: boolean
    payable: PayableConcept[]
    /**
     * Por qué NO se le puede pagar algo que uno esperaría poder pagarle.
     *
     * Son **aclaraciones, no errores**: se muestran en tono neutro. El caso más
     * común es la cadena ("para pagar la actividad tiene que tener la membresía
     * al día"), y ese se destraba solo si se suma la membresía al mismo carrito.
     */
    notes: string[]
}

/** Lo que se manda a `POST /payments/cart`: a quién y de qué, nada más. */
export interface CartSelectionItem {
    profileId: string
    concepts: PaymentConcept[]
}

export interface CreateCartPaymentPayload {
    items: CartSelectionItem[]
    paymentDate?: string
    file: File
}

/*
 * Acá vivía `CreatePaymentPayload`, el body de `POST /payments` —un pago = una
 * persona = un concepto—. El endpoint se retiró del backend junto con su DTO:
 * mientras convivía con el carrito era una puerta trasera a todo §5, porque
 * tomaba el concepto y el importe DEL CLIENTE, no evaluaba la cadena ni la
 * marca de jugador, y no consultaba ni la tabla de precios ni el descuento.
 *
 * `POST /payments/cart` es la única puerta de alta de comprobantes. Si alguna
 * vez hace falta un alta simple, es un carrito de una sola línea — no un
 * segundo camino "más corto".
 */

/** `NextDueResponseDto`: qué período le toca pagar al socio. */
export interface NextDue {
    /**
     * Período a pagar, formato YYYY-MM. El socio no lo elige: lo decide el
     * servidor.
     *
     * `null` cuando ya tiene cubierto el mes corriente: no se puede pagar por
     * adelantado, así que hasta que arranque el mes que viene no hay período.
     * Eso NO es un error, es "estás al día".
     */
    month: string | null
    /**
     * false por tres motivos distintos, y la pantalla los distingue mirando los
     * otros dos campos: hay un comprobante esperando validación
     * (`pendingPaymentId`), el socio es moroso (`delinquentSince`), o no hay
     * período que pagar (`month` en null).
     */
    canPay: boolean
    /** El pago que está bloqueando, cuando canPay es false por un pendiente. */
    pendingPaymentId: string | null
    /**
     * Con fecha = el socio es MOROSO y por eso no puede pagar desde la app:
     * tiene que acercarse a la sede. El período viene igual, para poder decirle
     * cuánto debe y por qué no lo puede saldar acá.
     */
    delinquentSince: string | null
}
