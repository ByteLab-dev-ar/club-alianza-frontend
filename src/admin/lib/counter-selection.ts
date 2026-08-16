import { PaymentConcepts, type PaymentConcept } from '@/payments/interfaces/Payment'
import type { CounterPerson } from '../interfaces/Counter'

export type CounterSelection = Record<string, PaymentConcept[]>

/**
 * Qué se le puede cobrar HOY a una persona, y qué ya está cubierto.
 *
 * A diferencia del carrito de la app, el mostrador no recibe una lista de
 * conceptos con precio: `GET /admin/counter/people/:id` devuelve la ficha, y de
 * ahí sale qué ofrecer. Las coberturas se normalizan al último día del mes, así
 * que `isActive` en true significa "el mes corriente ya está pago" — y cobrarlo
 * otra vez responde 409.
 *
 * **La categoría, el precio y el mes los sigue decidiendo el servidor.** Acá
 * solo se decide qué casillas dibujar.
 */
export const chargeableConcepts = (
    person: CounterPerson,
): { concept: PaymentConcept; covered: boolean; applies: boolean }[] => [
    {
        concept: PaymentConcepts.MEMBERSHIP,
        covered: person.isActive,
        applies: true,
    },
    // La actividad y el seguro son solo del jugador: a quien no está marcado no
    // se le pueden cobrar, y el POST responde 422.
    {
        concept: PaymentConcepts.ACTIVITY,
        covered: person.isActivityUpToDate,
        applies: person.isPlayer,
    },
    {
        concept: PaymentConcepts.INSURANCE,
        covered: person.isInsuranceUpToDate,
        applies: person.isPlayer,
    },
]

/**
 * Qué otros conceptos tienen que ir en el mismo cobro, por la cadena de §5.3.
 *
 * Es un **espejo** de la regla del servidor, que es quien valida: se evalúa
 * sobre cómo queda la persona DESPUÉS del pago, así que solo hace falta sumar lo
 * que todavía no está cubierto. Existe para que el tesorero no tenga que
 * deducirlo con alguien esperando del otro lado del mostrador; si alguna vez
 * divergiera, gana el 422 del backend y nadie cobra de menos.
 */
export const counterRequires = (
    person: CounterPerson,
    concept: PaymentConcept,
): PaymentConcept[] => {
    const missing: PaymentConcept[] = []

    if (concept === PaymentConcepts.ACTIVITY || concept === PaymentConcepts.INSURANCE) {
        if (!person.isActive) missing.push(PaymentConcepts.MEMBERSHIP)
    }
    if (concept === PaymentConcepts.INSURANCE && !person.isActivityUpToDate) {
        missing.push(PaymentConcepts.ACTIVITY)
    }

    return missing
}

/** Tilda o destilda arrastrando la cadena, igual que el carrito de la app. */
export const toggleCounterPick = (
    selection: CounterSelection,
    person: CounterPerson,
    concept: PaymentConcept,
): CounterSelection => {
    const current = selection[person.id] ?? []

    let next: PaymentConcept[]
    if (current.includes(concept)) {
        // Se sacan los que dependían de éste: dejar el seguro solo cuando se
        // destilda la actividad es un 422 esperando a que el tesorero cobre.
        const dependents = current.filter((picked) =>
            counterRequires(person, picked).includes(concept),
        )
        next = current.filter((picked) => picked !== concept && !dependents.includes(picked))
    } else {
        next = [...new Set([...current, concept, ...counterRequires(person, concept)])]
    }

    if (next.length === 0) {
        const rest = { ...selection }
        delete rest[person.id]
        return rest
    }

    return { ...selection, [person.id]: next }
}

/** Si el cobro pisa una transferencia que está esperando validación. */
export const collidingTransfers = (people: CounterPerson[], selection: CounterSelection) =>
    people.flatMap((person) => {
        const picked = selection[person.id] ?? []
        return person.pendingTransfers
            .filter((transfer) => picked.includes(transfer.concept))
            .map((transfer) => ({ person, transfer }))
    })
