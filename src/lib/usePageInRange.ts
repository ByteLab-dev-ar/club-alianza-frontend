import { useEffect, useEffectEvent } from 'react'

import type { PaginationMeta } from '@/api/types'
import { clampPage, isSettlingPage } from './pagination'

interface Options {
    /** La página que se le pidió al backend. */
    page: number
    /** La respuesta del listado tal como la da el hook (o el relleno). */
    data: { items: readonly unknown[]; meta: PaginationMeta } | undefined
    isPlaceholderData: boolean
    /** Cómo cambia la página la pantalla: un `setPage` o escribir la URL. */
    onPageChange: (page: number) => void
}

/**
 * Lleva la pantalla a la última página que existe cuando la pedida se quedó
 * sin elementos (ver `clampPage`), y avisa mientras tanto para que no se vea
 * el estado vacío.
 *
 * Devuelve `isSettling`: mientras sea `true`, la pantalla muestra el esqueleto
 * en vez de "Todavía no hay…" y esconde `<Pagination>`, que con la respuesta
 * de la página inexistente dibujaría "3 / 2".
 *
 * La corrección va en un efecto y no durante el render: en PaymentsPage la
 * página vive en la URL, y navegar mientras se renderiza es actualizar otro
 * componente (el Router). `useEffectEvent` porque `onPageChange` suele ser una
 * función nueva en cada render: como dependencia, el efecto repetía la
 * corrección con cada render mientras seguía pendiente.
 */
export const usePageInRange = ({ page, data, isPlaceholderData, onPageChange }: Options) => {
    const fix = clampPage(page, data?.meta, isPlaceholderData)
    const applyFix = useEffectEvent((nextPage: number) => onPageChange(nextPage))

    useEffect(() => {
        if (fix !== null) applyFix(fix)
    }, [fix])

    return {
        isSettling: isSettlingPage({
            requested: page,
            meta: data?.meta,
            isPlaceholderData,
            itemCount: data?.items.length,
        }),
    }
}
