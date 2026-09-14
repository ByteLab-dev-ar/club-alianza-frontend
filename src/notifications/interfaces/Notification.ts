/**
 * Un aviso en la campana.
 *
 * **El texto viene armado del servidor.** `title` y `body` se componen allá con
 * el contenido congelado del hecho más el nombre de quien lo recibe, así que
 * acá no se arma ninguna frase a partir de `type`: si el front las armara, cada
 * aviso nuevo obligaría a tocar las dos puntas.
 */
export interface BellNotice {
    /**
     * El id de la **ENTREGA**, no del aviso, y es lo que se marca como leído.
     *
     * El mismo hecho —el pago de un chico— le llega a la madre y al padre en
     * dos entregas distintas. Que una lo lea no apaga la otra, y así tiene que
     * ser: son dos personas enterándose.
     */
    id: string
    /**
     * Para elegir el ícono y a dónde lleva el click. **Nunca para armar el
     * texto** (ver arriba).
     *
     * Va como `string` y no como una unión cerrada a propósito, por el mismo
     * motivo que `paymentConceptLabel` toma `string`: el catálogo del backend
     * dice explícitamente que los tipos "se agregan, no se renombran", y además
     * conserva valores retirados —`PAYMENT_REMINDER`— porque las filas viejas
     * los siguen usando. Con una unión cerrada, un aviso nuevo del servidor
     * sería un tipo que acá no existe, y cualquier `Record` exhaustivo sobre él
     * estaría mintiendo. Ver `notification-meta.ts`.
     */
    type: string
    /** Ya redactado por el servidor. */
    title: string
    /** Ya redactado por el servidor. */
    body: string
    /** ISO. Cuándo ocurrió el HECHO, no cuándo se entregó. */
    at: string
    /** `null` mientras no se lea. Es lo que cuenta el badge. */
    readAt: string | null
}

/** Lo único que necesita el badge: va aparte para no traer cincuenta filas. */
export interface UnreadCount {
    unread: number
}

/**
 * La ÚNICA preferencia que existe, y apaga **un correo**, no la campana.
 *
 * No hay switch maestro de "desactivar notificaciones" y no lo va a haber: del
 * lado del servidor no existe. Nada de plata se apaga —cuota, morosidad, pago
 * rechazado—; esto solo deja de mandar el mail de coberturas por vencer, y la
 * campana lo sigue recibiendo igual.
 *
 * Arranca en `true`: el switch tiene que aparecer encendido por defecto.
 */
export interface NotificationPreferences {
    coverageEmails: boolean
}

/* ---- El panel de admin: con quién no se puede comunicar el club ---- */

/** Por qué el sistema dejó de escribirle a una casilla. */
export const SuppressionReasons = {
    /** La dirección no existe. */
    BOUNCED: 'BOUNCED',
    /** La marcaron como spam. */
    COMPLAINED: 'COMPLAINED',
} as const

export type SuppressionReason = (typeof SuppressionReasons)[keyof typeof SuppressionReasons]

/** Una casilla a la que el sistema dejó de escribirle. */
export interface SuppressedEmail {
    email: string
    reason: SuppressionReason
    /** Lo que informó el proveedor, cuando lo informó. */
    detail: string | null
    /** ISO. */
    since: string
}

/**
 * Por qué un aviso no llegó. **Los dos no son lo mismo y la pantalla los
 * distingue**, porque llevan a acciones opuestas:
 *
 * - `FAILED`: se intentó escribir y no salió. Puede tener sentido reintentar.
 * - `NO_RECIPIENT`: **no había ninguna dirección a la que escribirle** —un socio
 *   sin cuenta, o un menor sin ningún tutor con correo usable—. Reintentar no
 *   arregla nada: se arregla cargando un correo o un tutor. Con el padrón
 *   importado va a ser el caso más común, y es la lista con la que el club va a
 *   salir a buscar teléfonos.
 */
export const DeliveryFailures = {
    FAILED: 'FAILED',
    NO_RECIPIENT: 'NO_RECIPIENT',
} as const

export type DeliveryFailure = (typeof DeliveryFailures)[keyof typeof DeliveryFailures]

/** Un aviso que no llegó, con lo necesario para entender por qué. */
export interface UndeliverableNotice {
    id: string
    type: string | null
    status: DeliveryFailure
    /** `null` cuando no había destinatario. */
    email: string | null
    reason: string | null
    attempts: number
    /** De quién habla el aviso. Puede estar archivado. */
    memberName: string | null
    memberNumber: number | null
    /** ISO. */
    at: string
}

export interface Undeliverable {
    suppressed: SuppressedEmail[]
    notices: UndeliverableNotice[]
}
