import type { PayableConcept, PaymentConcept } from '../interfaces/Payment'

/** Qué conceptos quedaron tildados, por persona. */
export type PayableSelection = Record<string, PaymentConcept[]>

/**
 * Lo mínimo que la selección necesita de una persona: quién es y qué se le
 * puede cobrar.
 *
 * Existe porque el carrito y el mostrador son la misma pantalla operada por dos
 * roles distintos (§5.10), pero llegan por endpoints que nombran distinto al id
 * del perfil —`profileId` en `GET /payments/cart`, `id` en el padrón—. Quien
 * arma la lista normaliza ese nombre y esta lógica queda con una sola forma que
 * conocer, en vez de reimplementarse de un lado.
 */
export interface PayablePerson {
    profileId: string
    payable: PayableConcept[]
}

export const isPicked = (
    selection: PayableSelection,
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
    selection: PayableSelection,
    person: PayablePerson,
    concept: PaymentConcept,
): PayableSelection => {
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
 * importe mandado desde el navegador. En el mostrador cumple otra función
 * además de informar —es el número que el tesorero dice en voz alta antes de
 * recibir la plata—, pero sigue sin viajar.
 */
export const selectedTotal = (people: PayablePerson[], selection: PayableSelection): number =>
    people.reduce((total, person) => {
        const picked = selection[person.profileId] ?? []
        return (
            total +
            person.payable
                .filter((item) => picked.includes(item.concept))
                .reduce((sum, item) => sum + item.amount, 0)
        )
    }, 0)
