import { describe, expect, it } from 'vitest'

import { notificationMeta } from './notification-meta'

describe('notificationMeta', () => {
    it('resuelve un tipo conocido con su destino', () => {
        const meta = notificationMeta('PAYMENT_APPROVED')

        expect(meta.to).toBe('/mi-cuenta/pagos')
        expect(meta.tone).toBe('positive')
    })

    it('cae en genérico con un tipo que el front no conoce', () => {
        // El caso que importa: el catálogo del backend crece ("se agregan, no
        // se renombran"), así que un aviso nuevo llega antes de que este mapa lo
        // conozca. Tiene que mostrarse igual —el texto ya viene armado— y no
        // reventar la campana entera.
        const meta = notificationMeta('UN_TIPO_QUE_NO_EXISTE_TODAVIA')

        expect(meta.icon).toBeDefined()
        expect(meta.to).toBeNull()
        expect(meta.tone).toBe('neutral')
    })

    it('resuelve un tipo retirado que sigue vivo en las filas viejas', () => {
        // PAYMENT_REMINDER ya no se emite, pero el enum lo conserva porque las
        // entregas históricas lo siguen usando. Quien no vació su campana lo
        // tiene ahí, y tiene que verse como lo que es.
        const meta = notificationMeta('PAYMENT_REMINDER')

        expect(meta.to).toBe('/mi-cuenta/pagos')
    })

    it('no devuelve undefined para ningún tipo, sea cual sea', () => {
        for (const type of ['', 'x', 'PAYMENT_APPROVED', 'IMPORT_FINISHED']) {
            expect(notificationMeta(type)).toBeDefined()
        }
    })
})
