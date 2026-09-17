import { describe, expect, it } from 'vitest'
import {
    addMembersInOrder,
    groupMemberCandidates,
    joinNames,
    personName,
    suggestionNotice,
    type GroupPerson,
} from './family-groups'

const juan: GroupPerson = { id: 'p-juan', name: 'Juan', surname: 'Pérez' }
const ana: GroupPerson = { id: 'p-ana', name: 'Ana', surname: 'Pérez' }
const luis: GroupPerson = { id: 'p-luis', name: 'Luis', surname: 'Pérez' }

/** Lo que el panel nunca tiene que volver a decir: la regla del mes se retiró. */
const MODELO_POR_MES = /mes que viene|mes siguiente/

const YA_EN_OTRO = 'Ese socio ya pertenece al grupo "Familia Gómez". Sacalo de ahí primero: nadie puede estar en dos familias a la vez.'
const SIN_CONEXION = 'No pudimos conectarnos con el servidor. Revisá tu conexión.'

describe('groupMemberCandidates', () => {
    it('no ofrece a quien ya integra el grupo', () => {
        const candidates = groupMemberCandidates([juan, ana, luis], [ana.id], [])

        expect(candidates.map((member) => member.id)).toEqual([juan.id, luis.id])
    })

    it('sigue mostrando al recién sumado aunque el refresco ya lo trajo en el grupo', () => {
        // La pertenencia rige desde ya: después del click, `group.members` lo
        // incluye. Sin la excepción su fila desaparecía y con ella el "Sumado".
        const candidates = groupMemberCandidates([juan, ana], [ana.id], [ana.id])

        expect(candidates.map((member) => member.id)).toEqual([juan.id, ana.id])
    })

    it('respeta el orden de la búsqueda', () => {
        const candidates = groupMemberCandidates([luis, juan], [], [juan.id])

        expect(candidates).toEqual([luis, juan])
    })
})

describe('addMembersInOrder', () => {
    it('sigue con los demás cuando uno rebota', async () => {
        const result = await addMembersInOrder(
            [juan, ana, luis],
            async (member) => {
                if (member.id === ana.id) throw new Error(YA_EN_OTRO)
            },
            (error) => (error instanceof Error ? error.message : 'otro'),
        )

        expect(result.added).toEqual([juan, luis])
        expect(result.failed).toEqual([{ member: ana, reason: YA_EN_OTRO }])
    })

    it('suma de a uno y en serie, en el orden de la sugerencia', async () => {
        const order: string[] = []
        let running = 0
        let maxRunning = 0

        // Se mide afuera y no con un `expect` adentro del callback: ese
        // `expect` tiraba adentro del try/catch de `addMembersInOrder`, que lo
        // anotaba como un rechazo más en vez de hacer fallar el test.
        const result = await addMembersInOrder(
            [juan, ana, luis],
            async (member) => {
                running += 1
                maxRunning = Math.max(maxRunning, running)
                await Promise.resolve()
                order.push(member.id)
                running -= 1
            },
            () => '',
        )

        expect(maxRunning).toBe(1)
        expect(result.failed).toEqual([])
        expect(order).toEqual([juan.id, ana.id, luis.id])
    })
})

describe('personName y joinNames', () => {
    it('no escribe "null" cuando falta un dato del nombre', () => {
        expect(personName({ id: 'x', name: 'Ana', surname: null })).toBe('Ana')
        expect(personName({ id: 'x', name: null, surname: null })).toBe('Socio sin nombre')
    })

    it('une con comas y una "y" al final', () => {
        expect(joinNames([])).toBe('')
        expect(joinNames(['Ana'])).toBe('Ana')
        expect(joinNames(['Ana', 'Luis'])).toBe('Ana y Luis')
        expect(joinNames(['Ana', 'Luis', 'Marta'])).toBe('Ana, Luis y Marta')
    })
})

describe('suggestionNotice', () => {
    it('todo bien: un solo aviso de éxito que nombra a los que entraron', () => {
        const notice = suggestionNotice({
            groupName: 'Familia Pérez',
            added: [juan, ana, luis],
            failed: [],
        })

        expect(notice.tone).toBe('success')
        expect(notice.title).toContain('Familia Pérez')
        expect(notice.description).toContain('Juan Pérez, Ana Pérez y Luis Pérez')
        expect(notice.description).toContain('desde el próximo pago')
    })

    it('nunca vuelve a prometer el mes que viene', () => {
        const notices = [
            suggestionNotice({ groupName: 'Familia Pérez', added: [juan], failed: [] }),
            suggestionNotice({
                groupName: 'Familia Pérez',
                added: [juan],
                failed: [{ member: ana, reason: YA_EN_OTRO }],
            }),
        ]

        for (const notice of notices) {
            expect(`${notice.title} ${notice.description}`).not.toMatch(MODELO_POR_MES)
        }
    })

    it('a medias: dice en el título que el grupo se creó y a quién le faltó', () => {
        // El grupo ya existe: si el título no lo dice, volver a tocar
        // "Confirmar grupo" crea un segundo grupo con el mismo nombre.
        const notice = suggestionNotice({
            groupName: 'Familia Pérez',
            added: [juan, luis],
            failed: [{ member: ana, reason: YA_EN_OTRO }],
        })

        expect(notice.tone).toBe('warning')
        expect(notice.title).toBe('Se creó "Familia Pérez", pero faltó sumar a Ana Pérez')
        expect(notice.description).toContain('Quedaron en el grupo Juan Pérez y Luis Pérez.')
        expect(notice.description).toContain(`Ana Pérez: ${YA_EN_OTRO}`)
        expect(notice.description).toContain('Sumar socio')
    })

    it('agrupa a los que rebotaron por el mismo motivo', () => {
        const notice = suggestionNotice({
            groupName: 'Familia Pérez',
            added: [juan],
            failed: [
                { member: ana, reason: SIN_CONEXION },
                { member: luis, reason: SIN_CONEXION },
            ],
        })

        expect(notice.description).toContain(`Ana Pérez y Luis Pérez: ${SIN_CONEXION}`)
        expect(notice.description.split(SIN_CONEXION)).toHaveLength(2)
        expect(notice.description).toContain('Quedó en el grupo Juan Pérez.')
    })

    it('le pone punto al motivo que el backend manda sin punto', () => {
        const notice = suggestionNotice({
            groupName: 'Familia Pérez',
            added: [juan],
            failed: [{ member: ana, reason: 'Ese socio ya está en este grupo' }],
        })

        expect(notice.description).toContain('Ana Pérez: Ese socio ya está en este grupo. Lo que falta')
    })

    it('nadie entró: avisa que el grupo quedó vacío y qué hacer con él', () => {
        const notice = suggestionNotice({
            groupName: 'Familia Pérez',
            added: [],
            failed: [
                { member: juan, reason: SIN_CONEXION },
                { member: ana, reason: SIN_CONEXION },
            ],
        })

        expect(notice.tone).toBe('warning')
        expect(notice.title).toBe('Se creó "Familia Pérez", pero no se pudo sumar a nadie')
        expect(notice.description).toContain('quedó vacío')
        expect(notice.description).not.toContain('Quedaron en el grupo')
    })
})
