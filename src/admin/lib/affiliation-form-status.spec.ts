import { describe, expect, it } from 'vitest'

import { deriveAffiliationFormStatus } from './affiliation-form-status'
import type { AdminMemberDocument } from '../interfaces/AdminMember'

const doc = (overrides: Partial<AdminMemberDocument> = {}): AdminMemberDocument => ({
    id: 'doc-1',
    type: 'AFFILIATION_FORM',
    url: '/admin/members/socio-1/documents/doc-1',
    createdAt: '2026-08-20T14:00:00.000Z',
    signedAt: null,
    signedVia: null,
    ...overrides,
})

describe('deriveAffiliationFormStatus', () => {
    it('sin ficha, no hay firma', () => {
        expect(deriveAffiliationFormStatus([])).toEqual({ kind: 'missing' })
        expect(deriveAffiliationFormStatus(undefined)).toEqual({ kind: 'missing' })
    })

    it('el DNI no cuenta como ficha', () => {
        // Los tres documentos viven en la misma lista, y el socio que subió el
        // DNI y no firmó nada sigue sin ficha.
        const documents = [
            doc({ id: 'dni-1', type: 'DNI_FRONT' }),
            doc({ id: 'dni-2', type: 'DNI_BACK' }),
        ]

        expect(deriveAffiliationFormStatus(documents)).toEqual({ kind: 'missing' })
    })

    it('firmada en pantalla trae la fecha', () => {
        const documents = [
            doc({ signedVia: 'screen', signedAt: '2026-08-20T14:00:00.000Z' }),
        ]

        expect(deriveAffiliationFormStatus(documents)).toEqual({
            kind: 'screen',
            signedAt: '2026-08-20T14:00:00.000Z',
        })
    })

    it('firmada en PAPEL no es lo mismo que sin firmar, aunque no tenga fecha', () => {
        /*
         * El caso que motiva todo el módulo: la ficha que se archivó desde la
         * sede llega con `signedAt: null` porque el trazo nunca pasó por el
         * sistema. Mirando ese campo a secas se leería como "todavía no firmó",
         * y el panel le ofrecería subir una ficha que ya está guardada.
         */
        const documents = [doc({ signedVia: 'paper', signedAt: null })]

        expect(deriveAffiliationFormStatus(documents)).toEqual({ kind: 'paper' })
    })

    it('una ficha sin signedVia sigue contando como firmada', () => {
        // Respuesta de un backend viejo, sin los campos nuevos. Que exista el
        // documento ya descarta `missing`: lo contrario habilitaría el botón de
        // subir sobre una ficha que está.
        const sinCampo = { ...doc(), signedVia: null }

        expect(deriveAffiliationFormStatus([sinCampo])).toEqual({ kind: 'paper' })
        expect(
            deriveAffiliationFormStatus([
                { ...sinCampo, signedAt: '2026-08-20T14:00:00.000Z' },
            ]),
        ).toEqual({ kind: 'screen', signedAt: '2026-08-20T14:00:00.000Z' })
    })
})
