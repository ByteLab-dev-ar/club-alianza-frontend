import { formatCalendarDate } from '@/lib/format'
import { PaymentConcepts, type PaymentConcept } from '@/payments/interfaces/Payment'
import type { CurrentFees } from '../interfaces/Fee'

/**
 * Los conceptos que se revisan, en el orden en que se nombran.
 *
 * Son los tres de la cuota, en el orden de la cadena del backend
 * (`CONCEPT_CHAIN`), que es la misma lista con la que `/admin/pending-work`
 * cuenta los precios sin cargar. Escrita a mano y no con `Object.values`: si el
 * tipo crece con algo que no es cuota mensual —una entrada, el alquiler de la
 * cancha—, que eso no tenga precio no es trabajo pendiente de nadie, y el aviso
 * del Resumen no tiene por qué encenderse.
 */
const FEE_CONCEPTS: readonly PaymentConcept[] = [
    PaymentConcepts.MEMBERSHIP,
    PaymentConcepts.ACTIVITY,
    PaymentConcepts.INSURANCE,
]

/**
 * Cómo se nombra cada concepto adentro de la frase, con su artículo. No sale de
 * `PAYMENT_CONCEPT_LABELS` porque esos son rótulos ("Seguro", con mayúscula y
 * sin artículo), y acá hace falta "del seguro".
 */
const OF_CONCEPT: Record<PaymentConcept, string> = {
    MEMBERSHIP: 'de la membresía',
    ACTIVITY: 'de la actividad',
    INSURANCE: 'del seguro',
}

/** "a", "a y b", "a, b y c". */
const LIST = new Intl.ListFormat('es', { type: 'conjunction' })

/**
 * Qué conceptos no tienen un monto que rija este mes.
 *
 * `null` es "sin cargar" y cero es un monto: un concepto gratis a propósito no
 * es una alerta, y el backend compara igual, contra `null` y no contra 0.
 *
 * Una clave que no vino cuenta como sin cargar, igual que en Montos
 * (`FeesPage`, `current?.[concept] ?? null`): el aviso manda a esa pantalla, y
 * si una dice que falta un monto la otra no puede mostrarlo cargado.
 */
export const conceptsWithoutFee = (current: Partial<CurrentFees>): PaymentConcept[] =>
    FEE_CONCEPTS.filter((concept) => (current[concept] ?? null) === null)

/**
 * El aviso del Resumen, o `null` si no falta ninguno: solo existe cuando hay
 * algo que hacer.
 *
 * Nombra los conceptos en vez de decir "faltan precios": quien lo lee tiene que
 * saber cuál cargar sin abrir Montos para averiguarlo. Y dice la consecuencia,
 * que es lo que lo vuelve urgente: sin monto, el carrito y el mostrador no
 * ofrecen ese concepto, así que nadie puede pagarlo.
 *
 * "Monto" y no "precio" porque es la palabra de la pantalla a la que manda el
 * aviso ("Montos de la cuota", "Sin un monto cargado…").
 *
 * `month` es `YYYY-MM`, el mes en curso.
 */
export const missingFeesNotice = (missing: readonly PaymentConcept[], month: string): string | null => {
    if (missing.length === 0) return null

    const concepts = LIST.format(missing.map((concept) => OF_CONCEPT[concept]))
    const monthName = formatCalendarDate(`${month}-01`, 'MMMM')

    return missing.length === 1
        ? `Falta cargar el monto ${concepts} de ${monthName}: no se puede cobrar hasta que esté.`
        : `Falta cargar los montos ${concepts} de ${monthName}: no se pueden cobrar hasta que estén.`
}
