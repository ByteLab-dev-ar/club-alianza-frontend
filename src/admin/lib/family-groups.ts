import type { AdminMember } from '../interfaces/AdminMember'

/** Lo mínimo de un socio para decidir si se ofrece y para nombrarlo en un aviso. */
export type GroupPerson = Pick<AdminMember, 'id' | 'name' | 'surname'>

/**
 * A quiénes ofrecerles "Sumar" en el buscador del grupo.
 *
 * Los que ya integran el grupo no se ofrecen: el backend contestaría 409 "ese
 * socio ya está en este grupo" y el click no tenía por qué existir.
 *
 * **La excepción son los sumados en esta misma apertura del diálogo.** La
 * pertenencia rige desde ya, así que apenas se refresca el listado el recién
 * sumado pasa a estar en `group.members`. Con el filtro solo, su fila
 * desaparecía medio segundo después del click: el "Sumado" se veía un instante
 * y el admin, que carga una familia de a varios, se quedaba sin saber si el
 * hermano anterior había entrado. Se lo sigue mostrando, con su confirmación,
 * hasta cerrar el diálogo.
 *
 * (Antes, con la regla del mes siguiente, el problema era el inverso: el
 * sumado NO aparecía en `group.members` hasta el 1° y el botón volvía a
 * ofrecerlo. El registro de la sesión nació para eso y hoy cubre también la
 * ventana entre el click y el refresco.)
 */
export const groupMemberCandidates = <T extends { id: string }>(
    results: T[],
    groupMemberIds: string[],
    addedThisSession: string[],
): T[] => {
    const alreadyIn = new Set(groupMemberIds)
    const justAdded = new Set(addedThisSession)
    return results.filter((member) => justAdded.has(member.id) || !alreadyIn.has(member.id))
}

export interface MemberAddFailure<T> {
    member: T
    reason: string
}

export interface MembersAddResult<T> {
    added: T[]
    failed: MemberAddFailure<T>[]
}

/**
 * Suma a cada integrante de una sugerencia, de a uno y en serie, **sin cortar
 * en el primer rechazo**.
 *
 * El endpoint recibe un socio por llamada, así que no hay forma de que sea
 * todo o nada. Cada rechazo es de esa persona —ya está en otro grupo, o
 * todavía no es socia— y no dice nada de las demás: cortar ahí dejaba el grupo
 * con menos gente de la que se podía sumar, y sin saber a quién le faltaba.
 * Recorrerlos a todos permite contar al final, en un solo aviso, quién quedó y
 * quién no.
 *
 * `reasonOf` viene de afuera para que esto no importe el cliente HTTP y su
 * spec corra en node.
 */
export const addMembersInOrder = async <T>(
    members: T[],
    addOne: (member: T) => Promise<void>,
    reasonOf: (error: unknown) => string,
): Promise<MembersAddResult<T>> => {
    const added: T[] = []
    const failed: MemberAddFailure<T>[] = []

    for (const member of members) {
        try {
            await addOne(member)
            added.push(member)
        } catch (error) {
            failed.push({ member, reason: reasonOf(error) })
        }
    }

    return { added, failed }
}

export interface GroupNotice {
    tone: 'success' | 'warning'
    title: string
    description: string
}

/**
 * El nombre tal como lo tiene el padrón, o `null` si no hay ninguno que
 * mostrar.
 *
 * Existe aparte de `personName` porque no todas las frases aceptan el relleno:
 * en una lista "Socio sin nombre" es la fila correcta, pero un título armado con
 * template literal preferiría no nombrar a nadie antes que decir "Socio sin
 * nombre" o —lo que salía antes— "Sacar a null del grupo".
 */
export const personDisplayName = (person: GroupPerson): string | null =>
    [person.name, person.surname].filter(Boolean).join(' ') || null

export const personName = (person: GroupPerson): string =>
    personDisplayName(person) ?? 'Socio sin nombre'

/** "Ana", "Ana y Luis", "Ana, Luis y Marta". */
export const joinNames = (names: string[]): string => {
    const last = names[names.length - 1] ?? ''
    if (names.length <= 1) return last
    return `${names.slice(0, -1).join(', ')} y ${last}`
}

const withPeriod = (text: string): string => (/[.!?]$/.test(text) ? text : `${text}.`)

/**
 * Los motivos, agrupando a quienes rebotaron por lo mismo.
 *
 * Sin agrupar, un corte de conexión a mitad de camino repetía "No pudimos
 * conectarnos con el servidor" una vez por integrante y el aviso se volvía
 * ilegible justo cuando más hacía falta leerlo.
 */
const failureDetails = (failed: MemberAddFailure<GroupPerson>[]): string => {
    const byReason = new Map<string, string[]>()
    for (const { member, reason } of failed) {
        byReason.set(reason, [...(byReason.get(reason) ?? []), personName(member)])
    }
    return [...byReason]
        .map(([reason, names]) => `${joinNames(names)}: ${withPeriod(reason)}`)
        .join(' ')
}

/**
 * Qué decirle al admin después de confirmar una sugerencia. **Un solo aviso**
 * para toda la operación.
 *
 * Antes cada integrante sumado tiraba su propio "Listo…" —tres hermanos, tres
 * avisos iguales apilados— y si uno rebotaba, el error cortaba la operación
 * sin que nadie lo atrapara: el grupo quedaba creado con parte de la familia y
 * la pantalla no decía ni eso ni a quién le faltaba.
 *
 * Cuando algo falló el aviso lo dice en el título, porque el grupo YA existe:
 * volver a tocar "Confirmar grupo" crea otro con el mismo nombre. Por eso la
 * salida que se indica es completarlo desde su propia tarjeta.
 *
 * Esa salida se ofrece **condicional** ("si hace falta") y no como el paso que
 * sigue: los dos motivos más frecuentes que manda el backend son que la persona
 * todavía no es socia o que ya pertenece a otro grupo, y en ninguno de los dos
 * "Sumar socio" arregla nada — el admin buscaba ahí a alguien que el diálogo
 * también va a rechazar. El motivo, que sí dice qué hacer, queda a la vista.
 */
export const suggestionNotice = ({
    groupName,
    added,
    failed,
}: { groupName: string } & MembersAddResult<GroupPerson>): GroupNotice => {
    const addedNames = joinNames(added.map(personName))

    if (failed.length === 0) {
        return {
            tone: 'success',
            title: `Grupo "${groupName}" creado`,
            description: `Con ${addedNames}. ${added.length === 1 ? 'Cuenta' : 'Cuentan'} para el descuento desde el próximo pago.`,
        }
    }

    const details = failureDetails(failed)

    if (added.length === 0) {
        return {
            tone: 'warning',
            title: `Se creó "${groupName}", pero no se pudo sumar a nadie`,
            description: `${details} El grupo quedó vacío: completalo desde "Sumar socio" o borralo.`,
        }
    }

    return {
        tone: 'warning',
        title: `Se creó "${groupName}", pero faltó sumar a ${joinNames(failed.map(({ member }) => personName(member)))}`,
        description: `${added.length === 1 ? 'Quedó' : 'Quedaron'} en el grupo ${addedNames}. ${details} Si hace falta, se completa desde "Sumar socio".`,
    }
}

/** Lo que el descuento mira de cada integrante: si está marcado como jugador. */
export type GroupPlayerMark = GroupPerson & Pick<AdminMember, 'isPlayer'>

/**
 * Cuántos del grupo tienen que estar marcados como jugadores para que la
 * actividad salga al 50%. Es el mismo número que aplica el backend
 * (`FamilyDiscountService.hasActivityDiscount`: `jugadores.length >= 2`), y si
 * alguna vez cambia allá, acá hay un solo lugar donde cambiarlo.
 */
const PLAYERS_FOR_DISCOUNT = 2

/**
 * ¿A este grupo le corresponde el 50% en la actividad?
 *
 * Se cuenta por MARCADOS como jugador y no por quién pagó este mes: si se
 * contara por pago, el descuento cambiaría según qué haya en el carrito y un
 * tutor que paga en dos veces pagaría distinto que uno que paga junto.
 *
 * Vive acá y no en la página porque la misma cuenta la necesitan dos lugares
 * —la línea de la tarjeta y el aviso de la baja—, y escrita dos veces se
 * desincroniza: la tarjeta diría que hay descuento y el diálogo que no.
 */
export const hasActivityDiscount = (members: { isPlayer: boolean }[]): boolean =>
    members.filter((member) => member.isPlayer).length >= PLAYERS_FOR_DISCOUNT

/**
 * La frase que el diálogo de "Sacar del grupo" suma **solo cuando esa baja deja
 * al grupo sin el 50%**; `null` en el caso normal, que es que no lo deje.
 *
 * Es plata de otra persona, y es el único cambio de precio que la pantalla no
 * muestra por ningún otro lado: la tarjeta se actualiza después de la baja, así
 * que sin este aviso el club se enteraba en el próximo cobro. Va como
 * información, no como advertencia: la decisión es del club y sacar a alguien
 * de un grupo es una operación normal.
 *
 * **No alcanza con mirar cuántos jugadores quedan.** En un grupo que ya pagaba
 * entero —un jugador solo— sacar a cualquiera también deja menos de dos, y
 * avisar ahí sería anunciar un cambio de precio que no ocurre. Por eso primero
 * se pregunta si el descuento existía.
 *
 * Se nombra a quien queda cuando el padrón tiene el nombre; sin nombre se dice
 * "un solo jugador" antes que "Socio sin nombre", que en una frase sobre plata
 * se lee como un error del sistema.
 */
export const discountLossOnRemoval = (
    members: GroupPlayerMark[],
    profileId: string,
): string | null => {
    if (!hasActivityDiscount(members)) return null

    const remaining = members.filter((member) => member.isPlayer && member.id !== profileId)

    if (remaining.length >= PLAYERS_FOR_DISCOUNT) return null

    const alone = remaining[0]

    // Sin ningún jugador restante no hay a quién le cambie el precio. Desde
    // esta pantalla no se llega (para entrar acá hacían falta dos, así que
    // sacando a uno queda uno), pero el arreglo lo permite y el mensaje
    // hablaría de un jugador que no existe.
    if (!alone) return null

    const name = personDisplayName(alone)

    return name
        ? `Queda un solo jugador, ${name}: pasa a pagar la actividad al 100%.`
        : 'Queda un solo jugador en el grupo: pasa a pagar la actividad al 100%.'
}
