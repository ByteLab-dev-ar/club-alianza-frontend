import { PaymentMethods, type PaymentMethod } from '../interfaces/Payment'

/** Lo mínimo para elegir: por qué medio entró el pago y cuándo se creó. */
export interface DatedPayment {
    method: PaymentMethod
    /** ISO 8601, así que ordena bien comparándolo como texto. */
    createdAt: string
}

/**
 * Cuál de los pagos del socio es el que se acaba de hacer por Mercado Pago.
 *
 * **Esta función existe para NO leer la URL de retorno.** Mercado Pago devuelve
 * a la app con `status`, `collection_status` y `payment_id` colgando de la
 * query, y eso lo controla el navegador: alcanza con escribirla a mano para
 * darse por aprobado, o para pedir el pago de otra persona. El pago se deduce
 * del propio historial —que el backend ya devuelve scopeado a la sesión— y su
 * estado sale de ahí, que es lo único que el proveedor no puede escribir.
 *
 * Se recorre en vez de ordenar a propósito: `sort` muta el array que recibe, y
 * acá lo que llega es el array que TanStack Query tiene en cache. Ordenarlo en
 * el lugar reordenaría el historial de la otra pantalla, que lo muestra por su
 * cuenta.
 *
 * Con dos pagos del mismo instante se queda con el primero de la lista. Es un
 * empate que en la práctica no pasa —hay uno por checkout— y cualquiera de los
 * dos sería igual de correcto.
 */
export const latestMercadoPagoPayment = <T extends DatedPayment>(
    payments: readonly T[],
): T | undefined =>
    payments.reduce<T | undefined>((latest, payment) => {
        if (payment.method !== PaymentMethods.MERCADO_PAGO) return latest
        if (!latest) return payment

        return payment.createdAt.localeCompare(latest.createdAt) > 0 ? payment : latest
    }, undefined)
