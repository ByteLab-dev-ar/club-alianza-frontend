import { describe, expect, it } from 'vitest'
import {
    addMembersInOrder,
    discountLossOnRemoval,
    groupMemberCandidates,
    hasActivityDiscount,
    joinNames,
    personDisplayName,
    personName,
    suggestionNotice,
    type GroupPerson,
    type GroupPlayerMark,
} from './family-groups'

const juan: GroupPerson = { id: 'p-juan', name: 'Juan', surname: 'Pérez' }
const ana: GroupPerson = { id: 'p-ana', name: 'Ana', surname: 'Pérez' }
const luis: GroupPerson = { id: 'p-luis', name: 'Luis', surname: 'Pérez' }

/** La marca de jugador, que es lo único que el descuento mira del integrante. */
const juega = (person: GroupPerson): GroupPlayerMark => ({ ...person, isPlayer: true })
const noJuega = (person: GroupPerson): GroupPlayerMark => ({ ...person, isPlayer: false })

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

describe('personName, personDisplayName y joinNames', () => {
    it('no escribe "null" cuando falta un dato del nombre', () => {
        expect(personName({ id: 'x', name: 'Ana', surname: null })).toBe('Ana')
        expect(personName({ id: 'x', name: null, surname: null })).toBe('Socio sin nombre')
    })

    it('personDisplayName no rellena: sin nombre devuelve null', () => {
        // Es lo que separa las dos frases. El título del diálogo de baja usa
        // esta: con el relleno diría "Sacar a Socio sin nombre del grupo", y
        // leyendo los campos crudos —como estaba— decía "Sacar a null del
        // grupo".
        expect(personDisplayName({ id: 'x', name: 'Ana', surname: null })).toBe('Ana')
        expect(personDisplayName({ id: 'x', name: null, surname: null })).toBeNull()
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

    it('ofrece "Sumar socio" como una salida condicional, no como el paso que sigue', () => {
        // Los dos motivos más frecuentes —ya está en otro grupo, todavía no es
        // socio— no se arreglan desde "Sumar socio": ahí el admin buscaba a
        // alguien que el diálogo también iba a rechazar.
        const notice = suggestionNotice({
            groupName: 'Familia Pérez',
            added: [juan],
            failed: [{ member: ana, reason: YA_EN_OTRO }],
        })

        expect(notice.description).toContain('Si hace falta, se completa desde "Sumar socio".')
        expect(notice.description).not.toContain('Lo que falta se completa')
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

        expect(notice.description).toContain(
            'Ana Pérez: Ese socio ya está en este grupo. Si hace falta',
        )
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

describe('hasActivityDiscount', () => {
    it('hacen falta dos marcados como jugadores; con uno solo se paga entero', () => {
        // El mismo umbral que aplica el backend (`FamilyDiscountService`):
        // `jugadores.length >= 2`. Con uno solo, 100%.
        expect(hasActivityDiscount([])).toBe(false)
        expect(hasActivityDiscount([juega(juan)])).toBe(false)
        expect(hasActivityDiscount([juega(juan), noJuega(ana)])).toBe(false)
        expect(hasActivityDiscount([juega(juan), juega(ana)])).toBe(true)
    })

    it('el que no está marcado como jugador no suma, aunque el grupo sea grande', () => {
        expect(hasActivityDiscount([noJuega(juan), noJuega(ana), noJuega(luis)])).toBe(false)
    })
})

describe('discountLossOnRemoval', () => {
    it('dos jugadores y saco a uno: avisa y nombra al que se queda pagando entero', () => {
        const aviso = discountLossOnRemoval([juega(juan), juega(ana)], juan.id)

        expect(aviso).toBe('Queda un solo jugador, Ana Pérez: pasa a pagar la actividad al 100%.')
    })

    it('la familia más común —una madre que no juega y dos chicos que sí—: sacar a un chico avisa', () => {
        // El que no juega NO reemplaza al jugador que se va. Contándolo, el
        // resto quedaba en dos y el aviso no salía: y esta es la forma de
        // familia más común del club, así que el caso "dos jugadores solos" no
        // alcanza para fijar la regla — con el filtro de jugador roto, ese test
        // pasa igual.
        const aviso = discountLossOnRemoval([noJuega(juan), juega(ana), juega(luis)], ana.id)

        expect(aviso).toBe('Queda un solo jugador, Luis Pérez: pasa a pagar la actividad al 100%.')
    })

    it('tres jugadores y saco a uno: el descuento sigue, así que no avisa nada', () => {
        const aviso = discountLossOnRemoval([juega(juan), juega(ana), juega(luis)], juan.id)

        expect(aviso).toBeNull()
    })

    it('saco a alguien que no juega: el descuento no se toca', () => {
        const aviso = discountLossOnRemoval([juega(juan), juega(ana), noJuega(luis)], luis.id)

        expect(aviso).toBeNull()
    })

    it('el grupo ya pagaba entero: sacar al que no juega no cambia ningún precio', () => {
        // Mirando solo "cuántos jugadores quedan" acá salía el aviso: queda
        // uno. Pero ya había uno solo, así que el 100% no es una novedad y el
        // diálogo anunciaría un cambio de precio que no ocurre.
        const aviso = discountLossOnRemoval([juega(juan), noJuega(ana)], ana.id)

        expect(aviso).toBeNull()
    })

    it('el grupo ya pagaba entero: sacar al único jugador tampoco', () => {
        const aviso = discountLossOnRemoval([juega(juan), noJuega(ana)], juan.id)

        expect(aviso).toBeNull()
    })

    it('sin nombre en el padrón no escribe "Socio sin nombre" en una frase sobre plata', () => {
        const anonimo: GroupPerson = { id: 'p-anon', name: null, surname: null }

        const aviso = discountLossOnRemoval([juega(juan), juega(anonimo)], juan.id)

        expect(aviso).toBe('Queda un solo jugador en el grupo: pasa a pagar la actividad al 100%.')
    })

    it('es informativo: no dice que se pierda nada ni usa palabras de alarma', () => {
        const aviso = discountLossOnRemoval([juega(juan), juega(ana)], juan.id) ?? ''

        expect(aviso).not.toMatch(/atención|cuidado|advertencia|pierde|perderá/i)
        expect(aviso.length).toBeLessThan(90)
    })
})
