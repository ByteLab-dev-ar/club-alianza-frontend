import { describe, expect, it } from 'vitest'

import { PaymentMethods } from '../interfaces/Payment'
import { latestMercadoPagoPayment, type DatedPayment } from './mercado-pago-return'

const pago = (id: string, method: DatedPayment['method'], createdAt: string) => ({
    id,
    method,
    createdAt,
})

describe('latestMercadoPagoPayment', () => {
    it('devuelve el más reciente de Mercado Pago', () => {
        const payments = [
            pago('viejo', PaymentMethods.MERCADO_PAGO, '2026-08-01T10:00:00.000Z'),
            pago('nuevo', PaymentMethods.MERCADO_PAGO, '2026-08-20T10:00:00.000Z'),
            pago('medio', PaymentMethods.MERCADO_PAGO, '2026-08-10T10:00:00.000Z'),
        ]

        expect(latestMercadoPagoPayment(payments)?.id).toBe('nuevo')
    })

    it('ignora los otros medios aunque sean más nuevos', () => {
        // El caso que importa: el socio paga por Mercado Pago, vuelve, y en el
        // medio subió una transferencia. La pantalla de retorno tiene que hablar
        // del pago que acaba de hacer, no del último que exista.
        const payments = [
            pago('mp', PaymentMethods.MERCADO_PAGO, '2026-08-20T10:00:00.000Z'),
            pago('transferencia', PaymentMethods.TRANSFER, '2026-08-21T10:00:00.000Z'),
            pago('mostrador', PaymentMethods.CASH, '2026-08-22T10:00:00.000Z'),
        ]

        expect(latestMercadoPagoPayment(payments)?.id).toBe('mp')
    })

    it('devuelve undefined cuando no hay ninguno por ese medio', () => {
        // Alguien entró a la URL de retorno sin haber pagado. No es un error:
        // la pantalla lo dice y manda al historial.
        const payments = [
            pago('transferencia', PaymentMethods.TRANSFER, '2026-08-21T10:00:00.000Z'),
        ]

        expect(latestMercadoPagoPayment(payments)).toBeUndefined()
    })

    it('devuelve undefined con la lista vacía', () => {
        expect(latestMercadoPagoPayment([])).toBeUndefined()
    })

    it('no reordena la lista que recibe', () => {
        // Lo que llega es el array que TanStack Query tiene en cache y que el
        // historial muestra por su cuenta: ordenarlo en el lugar le cambiaría
        // las filas a la otra pantalla.
        const payments = [
            pago('viejo', PaymentMethods.MERCADO_PAGO, '2026-08-01T10:00:00.000Z'),
            pago('nuevo', PaymentMethods.MERCADO_PAGO, '2026-08-20T10:00:00.000Z'),
        ]

        latestMercadoPagoPayment(payments)

        expect(payments.map((payment) => payment.id)).toEqual(['viejo', 'nuevo'])
    })
})
