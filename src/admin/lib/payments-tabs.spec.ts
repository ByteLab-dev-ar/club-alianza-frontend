import { describe, expect, it } from 'vitest'

import { DEFAULT_PAYMENTS_TAB, PAYMENTS_TABS, parsePaymentsTab } from './payments-tabs'

describe('parsePaymentsTab', () => {
    it('sin ?estado= aterriza en Pendientes', () => {
        // `/admin/pagos` a secas tiene que seguir significando lo mismo que
        // siempre: lo que tesorería viene a resolver.
        expect(parsePaymentsTab(null).label).toBe('Pendientes')
    })

    it('los links viejos siguen andando', () => {
        // La solapa dejó de ser "el status" pero los valores no cambiaron: un
        // `/admin/pagos?estado=APPROVED` compartido hace meses tiene que abrir
        // donde abría.
        expect(parsePaymentsTab('APPROVED').query).toEqual({ status: 'APPROVED' })
        expect(parsePaymentsTab('REVERTED').query).toEqual({ status: 'REVERTED' })
    })

    it('un valor que no es solapa cae en el default', () => {
        // Alguien editando la URL a mano, o un estado que se retiró.
        expect(parsePaymentsTab('REFUNDED')).toBe(DEFAULT_PAYMENTS_TAB)
        expect(parsePaymentsTab('')).toBe(DEFAULT_PAYMENTS_TAB)
    })
})

describe('qué pide cada solapa', () => {
    const tabQuery = (value: string) => parsePaymentsTab(value).query

    it('Pendientes pide SOLO transferencias', () => {
        /*
         * El punto entero del filtro: una transferencia pendiente espera que una
         * persona del club mire el comprobante; un Mercado Pago pendiente espera
         * al proveedor. Sin el `method`, la bandeja le muestra a tesorería
         * checkouts abandonados que no puede resolver ni sacar de ahí.
         */
        expect(tabQuery('PENDING')).toEqual({ status: 'PENDING', method: 'TRANSFER' })
    })

    it('ya no hay solapa de checkouts sin terminar', () => {
        // Se sacó: eran filas sobre las que el club no puede hacer nada. El
        // filtro de "Pendientes" se conserva igual, que era la mitad valiosa.
        //
        // Los valores se ensanchan a `string` a propósito. Mientras la solapa no
        // exista, 'CHECKOUTS' no está en el union de `PAYMENTS_TABS` y TypeScript
        // rechaza la comparación por imposible (TS2367): el chequeo no compilaba
        // justo mientras se cumplía. Ensanchado sigue haciendo su trabajo — si
        // alguien vuelve a agregar la solapa, esto falla.
        const valores: readonly string[] = PAYMENTS_TABS.map((tab) => tab.value)

        expect(valores).not.toContain('CHECKOUTS')
    })

    it('Todos no filtra nada, y es donde quedan los pendientes de Mercado Pago', () => {
        // Importa desde que se sacó la solapa: si esta filtrara algo, un
        // pendiente de Mercado Pago no aparecería en NINGUNA parte del panel.
        expect(tabQuery('all')).toEqual({})
    })
})

describe('PAYMENTS_TABS', () => {
    it('no repite valores', () => {
        // Dos solapas con el mismo valor serían una URL que abre la otra: el
        // `find` de `parsePaymentsTab` devuelve la primera.
        const values = PAYMENTS_TABS.map((tab) => tab.value)

        expect(new Set(values).size).toBe(values.length)
    })
})
