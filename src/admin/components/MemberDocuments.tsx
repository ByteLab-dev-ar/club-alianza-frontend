import { ExternalLink, FileText, Loader2 } from 'lucide-react'

import { useOpenPrivateFile } from '@/lib/open-private-file'
import { useMemberDocuments } from '../hooks/useMemberDocuments'
import { DOCUMENT_TYPE_LABELS } from '@/members/interfaces/MemberProfile'

interface Props {
    memberId: string
    /**
     * Falso mientras el visor está cerrado, para no pedir el listado de cada
     * fila de una tabla. Por defecto va en true: el uso original es una ficha
     * abierta, donde los documentos ya están a la vista.
     */
    enabled?: boolean
}

/**
 * Documentos privados del socio. Los ven ADMIN y ACCOUNTANT —tesorería cobra en
 * la sede y verificar quién está del otro lado del mostrador es parte de esa
 * operación—: el backend los sirve por un endpoint propio que exige sesión, no
 * por una URL del storage.
 */
export const MemberDocuments = ({ memberId, enabled = true }: Props) => {
    const { data: documents, isLoading, isError } = useMemberDocuments(memberId, enabled)
    const { open: openDocument, openingId } = useOpenPrivateFile()

    if (isLoading) {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Cargando documentos…
            </p>
        )
    }

    if (isError) {
        return (
            <p className="text-sm text-muted-foreground">
                No pudimos cargar los documentos.
            </p>
        )
    }

    if (!documents || documents.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                El socio todavía no subió documentación.
            </p>
        )
    }

    return (
        /*
         * Filas de ancho completo y no una grilla de dos columnas.
         *
         * Acá había un `sm:grid-cols-2`, y el problema es dónde vive esto: en la
         * ficha del socio el card ocupa UN tercio de la grilla, así que media
         * columna de eso son ~140px. "Ficha de afiliación firmada" se partía en
         * tres líneas y su caja quedaba 19px más alta que las de DNI, sola en su
         * fila. En una columna angosta, filas.
         *
         * De paso entran en menos alto que antes: tres filas de 46px contra dos
         * cajas de 72.
         */
        <div className="flex flex-col gap-2">
            {/* Botón y no <a>: el archivo lo sirve un endpoint con sesión, y una
                navegación del navegador no pasa por el refresh de token (ver
                openAuthedFile).

                `cursor-pointer` a mano: Tailwind v4 dejó de ponérselo a los
                botones —v3 sí lo hacía— y sin esto el puntero no cambia, o sea
                que nada dice que la caja se puede tocar. */}
            {documents.map((document) => (
                <button
                    key={document.id}
                    type="button"
                    disabled={openingId === document.id}
                    onClick={() => void openDocument(document.id, document.url)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:border-secondary hover:bg-accent disabled:cursor-default disabled:opacity-60"
                >
                    {openingId === document.id ? (
                        <Loader2 className="size-5 shrink-0 animate-spin text-brand" />
                    ) : (
                        <FileText className="size-5 shrink-0 text-brand" />
                    )}
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                        {DOCUMENT_TYPE_LABELS[document.type]}
                    </span>
                    {/* Lo único que decía que esto abre algo era el ícono de
                        archivo, que también podría ser decoración. */}
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                </button>
            ))}
        </div>
    )
}
