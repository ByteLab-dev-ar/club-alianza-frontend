import type { CoverageOutcome } from '../interfaces/AdminPayment'

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
 * pago no otorgaba nada tesorería se llevaba la confirmación contraria.
 *
 * La defensa ante un valor inesperado está INVERTIDA respecto de la versión
 * anterior, y es la parte importante. Antes el default era afirmar que se
 * extendió el vencimiento, para que un backend viejo —sin el campo— se
 * comportara como siempre. Eso se dio vuelta cuando el campo se renombró de
 * `coverageExtended` a `coverageOutcome`: el nombre viejo pasó a estar ausente
 * SIEMPRE, y la rama "tolerante" dejó de ser un caso de borde para convertirse
 * en el único camino, afirmando en cada aprobación algo que podía ser falso.
 * Ahora lo desconocido cae en un mensaje neutro: no prometemos lo que no
 * podemos verificar.
 */
export const approvalNotice = (payment: {
    coverageOutcome?: CoverageOutcome
}): ApprovalNotice => {
    switch (payment.coverageOutcome) {
        case 'extended':
            return {
                tone: 'success',
                title: 'Pago aprobado. Se actualizó el vencimiento del socio.',
            }

        case 'already_covered':
            return {
                tone: 'warning',
                title: 'Aprobado, pero no le movió el vencimiento',
                description:
                    'El socio ya estaba cubierto hasta ese mes o más allá, así que este pago no le sumó tiempo. Si era por otro período, pedile a un administrador que le corrija el vencimiento desde la ficha.',
            }

        case 'not_a_membership_payment':
            // No era cuota: no correspondía extender nada. Se confirma la
            // aprobación sin mencionar vencimientos, que acá no vienen al caso.
            return { tone: 'success', title: 'Pago aprobado.' }

        default:
            // Campo ausente o con un valor que este front no conoce (backend más
            // nuevo). Se confirma lo único que sí sabemos —que quedó aprobado— y
            // no se afirma nada sobre el vencimiento.
            return { tone: 'success', title: 'Pago aprobado.' }
    }
}
