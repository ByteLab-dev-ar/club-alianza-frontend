import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useAdminChrome } from './admin-chrome-context'

interface Props {
    kicker?: string
    title: string
    /**
     * La bajada de la pantalla. **Es lo único que NO sube a la banda**: son dos
     * o tres renglones de prosa que explican una regla del club, y una barra de
     * 44px no es lugar para leerlos. Se queda arriba del contenido, que es donde
     * se lee una vez y no molesta después.
     */
    description?: string
    /** Los filtros de la pantalla, a la izquierda del segundo piso. */
    filters?: ReactNode
    /** Acciones alineadas a la derecha del segundo piso ("Nuevo socio", etc.). */
    actions?: ReactNode
}

/**
 * Lo que cada pantalla del panel pone en la banda superior.
 *
 * Se sigue escribiendo igual que siempre —`<AdminPageHeader kicker title
 * actions />` arriba de la página— pero ya no dibuja un bloque en el contenido:
 * manda su contenido a los dos pisos de la banda por un portal. Catorce
 * pantallas se mudaron arriba sin tocar catorce archivos.
 *
 * El portal se saltea si el hueco todavía no existe (`identity &&`), que es lo
 * que pasa en el primer render y mientras una pantalla carga su código.
 */
export const AdminPageHeader = ({ kicker, title, description, filters, actions }: Props) => {
    const { identity, page } = useAdminChrome()

    const hasPageRow = Boolean(filters || actions)

    return (
        <>
            {identity &&
                createPortal(
                    <>
                        {/* El kicker al LADO del título y no arriba: apilados
                            piden 60px de alto, que es justo lo que la banda vino
                            a recuperar. Al lado, la misma información entra en
                            una fila y se lee como una ruta. */}
                        {kicker && (
                            <span className="kicker shrink-0 text-sidebar-foreground/45">
                                {kicker}
                            </span>
                        )}
                        <span className="truncate font-display text-base font-bold text-sidebar-foreground">
                            {title}
                        </span>
                    </>,
                    identity,
                )}

            {page &&
                hasPageRow &&
                createPortal(
                    <>
                        {filters}
                        {/* `ml-auto` sobre el grupo y no sobre cada botón: con
                            varios, lo que se separa del filtro es el grupo
                            entero. */}
                        {actions && (
                            <div className="ml-auto flex flex-wrap items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </>,
                    page,
                )}

            {description && (
                <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </>
    )
}
