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

export const personName = (person: GroupPerson): string =>
    [person.name, person.surname].filter(Boolean).join(' ') || 'Socio sin nombre'

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
        description: `${added.length === 1 ? 'Quedó' : 'Quedaron'} en el grupo ${addedNames}. ${details} Lo que falta se completa desde "Sumar socio", en el grupo.`,
    }
}
