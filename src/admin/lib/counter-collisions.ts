import type { PayableSelection } from '@/payments/lib/payable-selection'
import type { CounterPerson } from '../interfaces/Counter'

/**
 * Qué transferencias pendientes va a pisar este cobro.
 *
 * Es lo único que el mostrador calcula por su cuenta, y no es una regla de
 * negocio: es cruzar lo que el tesorero tildó contra `pendingTransfers`, que el
 * servidor ya mandó por persona. La decisión sigue siendo suya —el POST rechaza
 * esos comprobantes con el motivo "se cobró en la sede"—; esto solo se lo dice
 * ANTES, porque si no el rechazo pasa en silencio y la familia que transfirió Y
 * pagó en efectivo se entera sola (§5.10).
 *
 * Acá vivía además `counter-selection.ts`, que reimplementaba la cadena de §5.3
 * en el navegador porque el endpoint no mandaba `requires`. Ahora lo manda: la
 * selección es la misma del carrito (`payments/lib/payable-selection.ts`) y no
 * hay una segunda copia de la regla que se pueda desincronizar.
 */
export const collidingTransfers = (people: CounterPerson[], selection: PayableSelection) =>
    people.flatMap((person) => {
        const picked = selection[person.id] ?? []
        return person.pendingTransfers
            .filter((transfer) => picked.includes(transfer.concept))
            .map((transfer) => ({ person, transfer }))
    })
