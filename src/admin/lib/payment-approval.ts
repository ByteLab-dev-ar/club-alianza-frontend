import type { ApprovedPayment } from '../interfaces/AdminPayment'

export interface ApprovalNotice {
    tone: 'success' | 'warning'
    title: string
    /** Solo en el caso que necesita explicación; el éxito se cuenta en el título. */
    description?: string
}

/**
 * Qué decirle a tesorería después de aprobar un pago.
 *
 * Vive en un módulo aparte y no como un `if` adentro del hook porque el texto
 * venía mintiendo justo en el caso que hay que avisar: el toast afirmaba
 * "se actualizó el vencimiento del socio" sin mirar la respuesta, y cuando el
 * pago no otorgaba nada tesorería se llevaba la confirmación contraria. Acá el
 * spec fija que con `coverageExtended: false` el mensaje NO promete eso.
 *
 * El campo se lee tolerante a `undefined` a propósito: si el front sale antes
 * que el backend, un pago sin el campo cae en la rama de éxito y todo se
 * comporta como antes, en vez de mostrar una advertencia falsa.
 */
export const approvalNotice = (
    payment: Partial<Pick<ApprovedPayment, 'coverageExtended'>>,
): ApprovalNotice => {
    if (payment.coverageExtended === false) {
        return {
            tone: 'warning',
            title: 'Aprobado, pero no le movió el vencimiento',
            description:
                'El socio ya estaba cubierto hasta ese mes o más allá, así que este pago no le sumó tiempo. Si era por otro período, pedile a un administrador que le corrija el vencimiento desde la ficha.',
        }
    }

    return { tone: 'success', title: 'Pago aprobado. Se actualizó el vencimiento del socio.' }
}
