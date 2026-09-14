import {
    PaymentMethods,
    PaymentStatuses,
    type PaymentMethod,
    type PaymentStatus,
} from '@/payments/interfaces/Payment'

/** Lo que una solapa le pide al listado. Vacío = sin filtrar. */
interface PaymentsTabQuery {
    status?: PaymentStatus
    method?: PaymentMethod
}

/**
 * Las solapas del listado de pagos, cada una con la consulta que la define.
 *
 * **Antes el valor de la solapa ERA el status**: el tipo se derivaba del union
 * de `PaymentStatus` y la pantalla mandaba `status: tab`. Eso dejó de alcanzar
 * cuando "Pendientes" pasó a significar algo más angosto que un estado, así que
 * ahora cada solapa declara su propia query y el valor es solo su nombre en la
 * URL.
 *
 * **Por qué "Pendientes" pide además `method=TRANSFER`:** un pago pendiente son
 * dos cosas muy distintas según el medio. Una transferencia pendiente espera que
 * UNA PERSONA del club abra el comprobante y decida; un Mercado Pago pendiente
 * espera al PROVEEDOR, y nadie del club decide nada — desde que no se aprueba a
 * mano, encima sin ningún botón para sacarlo de ahí. Mezclados, un checkout que
 * el socio abandonó se queda en la bandeja para siempre mostrándole a tesorería
 * trabajo que no existe.
 *
 * El backend no los esconde por su cuenta, a propósito: la pantalla pide lo que
 * quiere decir, y "Todos" los sigue mostrando a todos.
 */
const TABS = [
    {
        value: 'PENDING',
        label: 'Pendientes',
        emptyMessage: 'No hay transferencias esperando validación. ¡Todo al día!',
        query: { status: PaymentStatuses.PENDING, method: PaymentMethods.TRANSFER },
    },
    /*
     * Acá hubo una solapa "Checkouts sin terminar" (PENDING + MERCADO_PAGO), y
     * se sacó el 2026-09-01: era una lista de filas sobre las que el club no
     * puede hacer NADA. La columna de acciones decía "Lo confirma Mercado Pago"
     * en todas, que es otra forma de decir que la solapa no servía para trabajar.
     *
     * Lo que sí se conserva es el filtro de arriba: sacarlos de "Pendientes"
     * era la mitad valiosa del cambio, porque esa bandeja SÍ es una cola de
     * trabajo. Los pendientes de Mercado Pago siguen visibles en "Todos", que
     * es donde se los busca cuando alguien pregunta por uno puntual.
     *
     * Y quedarse colgados dejó de ser su destino: `reconcile:mercadopago` en el
     * backend le pregunta al proveedor por los que llevan rato en PENDING y los
     * resuelve por el mismo camino que el aviso.
     */
    {
        value: 'APPROVED',
        label: 'Aprobados',
        emptyMessage: 'No hay pagos aprobados.',
        query: { status: PaymentStatuses.APPROVED },
    },
    {
        value: 'REJECTED',
        label: 'Rechazados',
        emptyMessage: 'No hay pagos rechazados.',
        query: { status: PaymentStatuses.REJECTED },
    },
    // Aparte de "Rechazados" y no mezclado con ellos: son los que SÍ se
    // acreditaron y después volvieron. Conciliando, esa es la diferencia entre
    // una plata que nunca entró y una que entró y se fue.
    {
        value: 'REVERTED',
        label: 'Revertidos',
        emptyMessage: 'No hay pagos revertidos.',
        query: { status: PaymentStatuses.REVERTED },
    },
    {
        value: 'all',
        label: 'Todos',
        emptyMessage: 'Todavía no hay ningún pago cargado.',
        query: {},
    },
] as const

/**
 * Los valores que acepta `?estado=`, derivados de la tabla de arriba en vez de
 * re-escritos: una solapa nueva entra en el union sola, y un valor que se retira
 * deja de compilar en donde se lo pasaba.
 */
export type PaymentsTabValue = (typeof TABS)[number]['value']

export interface PaymentsTab {
    /** Lo que viaja en `?estado=`. */
    value: PaymentsTabValue
    label: string
    /** Qué decir cuando la solapa no tiene ninguno. */
    emptyMessage: string
    query: PaymentsTabQuery
}

/**
 * La misma tabla, ensanchada.
 *
 * `as const` es lo que hace posible derivar el union de valores, pero de yapa
 * deja cada `query` con su forma exacta —la de "Aprobados" literalmente no tiene
 * la propiedad `method`—, así que preguntarle `tab.query.method` a una solapa
 * cualquiera no compila. Con la anotación de acá todas comparten el mismo tipo.
 */
export const PAYMENTS_TABS: readonly PaymentsTab[] = TABS

/** Por defecto, lo que tesorería viene a resolver. */
export const DEFAULT_PAYMENTS_TAB: PaymentsTab = TABS[0]

/**
 * Qué solapa pide la URL.
 *
 * Cae al default con cualquier cosa que no sea una solapa: `?estado=` a mano,
 * un valor viejo que dejó de existir, o un link que alguien editó. Nunca manda
 * al backend un filtro que no reconoce.
 */
export const parsePaymentsTab = (value: string | null): PaymentsTab =>
    PAYMENTS_TABS.find((tab) => tab.value === value) ?? DEFAULT_PAYMENTS_TAB
