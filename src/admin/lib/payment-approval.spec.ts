import { describe, expect, it } from 'vitest'
import { approvalNotice } from './payment-approval'

describe('approvalNotice', () => {
    it('con coverageExtended true confirma que se movió el vencimiento', () => {
        const notice = approvalNotice({ coverageExtended: true })

        expect(notice.tone).toBe('success')
        expect(notice.title).toContain('vencimiento')
    })

    it('con coverageExtended false NO promete que se haya actualizado el vencimiento', () => {
        // Es el motivo de existir del módulo: el texto viejo afirmaba
        // "Se actualizó el vencimiento del socio" pasara lo que pasara, y este
        // es exactamente el caso en que eso es falso.
        const notice = approvalNotice({ coverageExtended: false })

        expect(notice.tone).toBe('warning')
        expect(notice.title).not.toMatch(/[Ss]e actualizó el vencimiento/)
        expect(notice.description).toBeDefined()
    })

    it('avisa que el pago no sumó tiempo, no solo que algo salió distinto', () => {
        // El aviso tiene que ser accionable: sin esto, tesorería lee una
        // advertencia genérica y no sabe que el pago no otorgó nada.
        expect(approvalNotice({ coverageExtended: false }).description).toContain('no le sumó tiempo')
    })

    it('sin el campo (backend viejo) se comporta como antes, sin advertencia falsa', () => {
        expect(approvalNotice({}).tone).toBe('success')
    })
})
