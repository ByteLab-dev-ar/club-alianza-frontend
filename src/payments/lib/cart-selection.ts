import type { CartPerson, PaymentConcept } from '../interfaces/Payment'

/** Qué conceptos quedaron tildados, por persona. */
export type CartSelection = Record<string, PaymentConcept[]>

export const isPicked = (
    selection: CartSelection,
    profileId: string,
    concept: PaymentConcept,
): boolean => selection[profileId]?.includes(concept) ?? false

/**
 * Tilda o destilda un concepto arrastrando la cadena de §5.3, en las dos
 * direcciones.
 *
 * **Al tildar**, se suman sus `requires`. La cadena se evalúa sobre cómo queda
 * la persona DESPUÉS del pago, así que al jugador que arranca el mes sin nada
 * pago se le ofrece la actividad con precio y con `requires: ['MEMBERSHIP']`:
 * las dos tienen que viajar juntas o el POST responde 422. Ese es todo el punto
 * del diseño — la alternativa era pagar la membresía, esperar a que tesorería
 * validara la transferencia y volver a entrar. Dos viajes, todos los meses.
 *
 * **Al destildar**, se sacan los que dependían de él. Si no, destildar la
 * membresía dejaría la actividad sola en el carrito y el 422 aparecería recién
 * al enviar, después de haber elegido el comprobante.
 *
 * La persona que queda sin nada tildado se saca del objeto: así el payload no
 * lleva entradas con `concepts: []`, que el backend rechaza con un 400.
 */
export const togglePick = (
    selection: CartSelection,
    person: CartPerson,
    concept: PaymentConcept,
): CartSelection => {
    const current = selection[person.profileId] ?? []
    const item = person.payable.find((payable) => payable.concept === concept)

    let next: PaymentConcept[]
    if (current.includes(concept)) {
        const dependents = person.payable
            .filter((payable) => payable.requires.includes(concept))
            .map((payable) => payable.concept)

        next = current.filter((picked) => picked !== concept && !dependents.includes(picked))
    } else {
        next = [...new Set([...current, concept, ...(item?.requires ?? [])])]
    }

    if (next.length === 0) {
        const rest = { ...selection }
        delete rest[person.profileId]
        return rest
    }

    return { ...selection, [person.profileId]: next }
}

/**
 * El total de lo tildado.
 *
 * Es **informativo**: el que vale lo calcula el servidor con los precios
 * vigentes y el descuento familiar, y el endpoint directamente no acepta un
 * importe mandado desde el navegador.
 */
export const selectedTotal = (people: CartPerson[], selection: CartSelection): number =>
    people.reduce((total, person) => {
        const picked = selection[person.profileId] ?? []
        return (
            total +
            person.payable
                .filter((item) => picked.includes(item.concept))
                .reduce((sum, item) => sum + item.amount, 0)
        )
    }, 0)
