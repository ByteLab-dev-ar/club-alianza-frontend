import { describe, expect, it } from 'vitest'

import { receiptPdfFileName, receiptPdfUrl } from './receipt-pdf'

describe('receiptPdfFileName', () => {
    it('rellena con ceros a siete dígitos', () => {
        // El relleno no es cosmético: sin él, el explorador de archivos ordena
        // "recibo-10" antes que "recibo-9", y el tesorero que baja treinta
        // recibos los ve mezclados.
        expect(receiptPdfFileName(42)).toBe('recibo-0000042.pdf')
        expect(receiptPdfFileName(9)).toBe('recibo-0000009.pdf')
        expect(receiptPdfFileName(10)).toBe('recibo-0000010.pdf')
    })

    it('ordena alfabéticamente igual que numéricamente', () => {
        const nombres = [9, 10, 1043, 1].map(receiptPdfFileName)

        expect([...nombres].sort()).toEqual([1, 9, 10, 1043].map(receiptPdfFileName))
    })

    it('no recorta un número más largo que el relleno', () => {
        expect(receiptPdfFileName(12345678)).toBe('recibo-12345678.pdf')
    })
})

describe('receiptPdfUrl', () => {
    it('la del socio resuelve por id del PAGO', () => {
        expect(receiptPdfUrl.forPayment('abc')).toBe('/payments/abc/receipt-document/pdf')
    })

    it('la del mostrador resuelve por id del RECIBO', () => {
        // Son ids distintos y es la confusión fácil: el mostrador tiene a mano
        // el recibo, no el pago.
        expect(receiptPdfUrl.forReceipt('abc')).toBe('/admin/counter/receipts/abc/pdf')
    })

    it('no llevan el prefijo /api: lo pone el baseURL de clubApi', () => {
        // Con el prefijo adentro quedaría /api/api/... y da 404. Es el mismo
        // pozo que documenta `openPrivateFile`.
        expect(receiptPdfUrl.forPayment('abc').startsWith('/api/')).toBe(false)
        expect(receiptPdfUrl.forReceipt('abc').startsWith('/api/')).toBe(false)
    })
})
