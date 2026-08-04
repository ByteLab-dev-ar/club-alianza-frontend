import { describe, expect, it } from 'vitest'
import { approvalNotice } from './payment-approval'
import type { CoverageOutcome } from '../interfaces/AdminPayment'

/** Lo que nunca hay que afirmar salvo que el backend lo confirme. */
const PROMESA_DE_VENCIMIENTO = /[Ss]e actualizó el vencimiento/

describe('approvalNotice', () => {
    it('con "extended" confirma que se movió el vencimiento', () => {
        const notice = approvalNotice({ coverageOutcome: 'extended' })

        expect(notice.tone).toBe('success')
        expect(notice.title).toMatch(PROMESA_DE_VENCIMIENTO)
    })

    it('con "already_covered" NO promete que se haya actualizado el vencimiento', () => {
        // Es el motivo de existir del módulo: el texto viejo afirmaba
        // "Se actualizó el vencimiento del socio" pasara lo que pasara, y este
        // es exactamente el caso en que eso es falso.
        const notice = approvalNotice({ coverageOutcome: 'already_covered' })

        expect(notice.tone).toBe('warning')
        expect(notice.title).not.toMatch(PROMESA_DE_VENCIMIENTO)
        expect(notice.description).toBeDefined()
    })

    it('avisa que el pago no sumó tiempo, no solo que algo salió distinto', () => {
        // El aviso tiene que ser accionable: sin esto, tesorería lee una
        // advertencia genérica y no sabe que el pago no otorgó nada.
        expect(approvalNotice({ coverageOutcome: 'already_covered' }).description).toContain(
            'no le sumó tiempo',
        )
    })

    it('con "not_a_membership_payment" es éxito y no menciona el vencimiento', () => {
        // No era cuota: extender no correspondía. Advertir acá sería ruido en la
        // aprobación más común el día que exista otro tipo de pago.
        const notice = approvalNotice({ coverageOutcome: 'not_a_membership_payment' })

        expect(notice.tone).toBe('success')
        expect(notice.title).not.toMatch(PROMESA_DE_VENCIMIENTO)
    })

    it('sin el campo NO afirma que se actualizó el vencimiento', () => {
        // La defensa va al revés que antes: este era justo el agujero por el que
        // se coló el bug del rename. Ausente == no sabemos == no prometemos.
        const notice = approvalNotice({})

        expect(notice.tone).toBe('success')
        expect(notice.title).not.toMatch(PROMESA_DE_VENCIMIENTO)
    })

    it('con un valor desconocido tampoco afirma nada sobre el vencimiento', () => {
        // Un backend más nuevo podría sumar un caso que este front no conoce.
        const notice = approvalNotice({
            coverageOutcome: 'algo_que_no_existe_todavia' as CoverageOutcome,
        })

        expect(notice.tone).toBe('success')
        expect(notice.title).not.toMatch(PROMESA_DE_VENCIMIENTO)
    })
})
