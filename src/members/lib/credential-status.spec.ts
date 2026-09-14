import { describe, expect, it } from 'vitest'

import { credentialStatus, type CoverageInput } from './credential-status'

/** Un jugador con las tres coberturas al día. Desde acá se van apagando. */
const jugador: CoverageInput = {
    isPlayer: true,
    isActive: true,
    isActivityUpToDate: true,
    isInsuranceUpToDate: true,
}

const socio: CoverageInput = { ...jugador, isPlayer: false }

describe('credentialStatus', () => {
    it('con todo pago dice "Todo al día"', () => {
        expect(credentialStatus(jugador)).toEqual({ label: 'Todo al día', tone: 'ok' })
        expect(credentialStatus(socio)).toEqual({ label: 'Todo al día', tone: 'ok' })
    })

    it('la membresía manda sobre todo lo demás', () => {
        // El caso que ordena la regla: aunque actividad y seguro estén al día,
        // lo único que importa decir es lo que lo deja afuera.
        expect(credentialStatus({ ...jugador, isActive: false })).toEqual({
            label: 'Membresía vencida',
            tone: 'bloquea',
        })
    })

    it('la membresía tapa a las otras dos cuando faltan todas', () => {
        // Sin esto la pastilla diría "3 cuotas vencidas" y escondería que la
        // que impide entrar es la membresía.
        const todoVencido = {
            isPlayer: true,
            isActive: false,
            isActivityUpToDate: false,
            isInsuranceUpToDate: false,
        }

        expect(credentialStatus(todoVencido)).toEqual({
            label: 'Membresía vencida',
            tone: 'bloquea',
        })
    })

    it('lo que no bloquea va en ámbar, no en rojo', () => {
        // Un jugador al día con el club no puede parecer rechazado en la puerta.
        const sinActividad = credentialStatus({ ...jugador, isActivityUpToDate: false })

        expect(sinActividad).toEqual({ label: 'Actividad vencida', tone: 'falta' })
        expect(sinActividad.tone).not.toBe('bloquea')
    })

    it('escribe cada faltante con su género', () => {
        expect(credentialStatus({ ...jugador, isInsuranceUpToDate: false }).label).toBe(
            'Seguro vencido',
        )
        expect(credentialStatus({ ...jugador, isActivityUpToDate: false }).label).toBe(
            'Actividad vencida',
        )
    })

    it('con dos faltantes cuenta en vez de enumerar', () => {
        // "Actividad y seguro vencidos" no entra en la pastilla.
        expect(
            credentialStatus({
                ...jugador,
                isActivityUpToDate: false,
                isInsuranceUpToDate: false,
            }),
        ).toEqual({ label: '2 cuotas vencidas', tone: 'falta' })
    })

    it('al socio que no juega no le inventa deudas', () => {
        // El backend puede mandar estos dos en false para alguien que no es
        // jugador: no le faltan, no le corresponden.
        const noJugador = {
            isPlayer: false,
            isActive: true,
            isActivityUpToDate: false,
            isInsuranceUpToDate: false,
        }

        expect(credentialStatus(noJugador)).toEqual({ label: 'Todo al día', tone: 'ok' })
    })

    it('nunca dice el veredicto', () => {
        // La credencial dice qué le falta, no que lo rechazan.
        const combinaciones: CoverageInput[] = [true, false].flatMap((isActive) =>
            [true, false].flatMap((isActivityUpToDate) =>
                [true, false].flatMap((isInsuranceUpToDate) =>
                    [true, false].map((isPlayer) => ({
                        isPlayer,
                        isActive,
                        isActivityUpToDate,
                        isInsuranceUpToDate,
                    })),
                ),
            ),
        )

        for (const caso of combinaciones) {
            expect(credentialStatus(caso).label).not.toMatch(/entra/i)
        }
    })
})
