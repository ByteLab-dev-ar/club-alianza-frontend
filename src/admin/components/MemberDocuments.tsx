import { FileText, Loader2 } from 'lucide-react'

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
        <div className="grid gap-3 sm:grid-cols-2">
            {/* Botón y no <a>: el archivo lo sirve un endpoint con sesión, y una
                navegación del navegador no pasa por el refresh de token (ver
                openAuthedFile). */}
            {documents.map((document) => (
                <button
                    key={document.id}
                    type="button"
                    disabled={openingId === document.id}
                    onClick={() => void openDocument(document.id, document.url)}
                    className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-secondary hover:bg-accent disabled:opacity-60"
                >
                    {openingId === document.id ? (
                        <Loader2 className="size-5 shrink-0 animate-spin text-brand" />
                    ) : (
                        <FileText className="size-5 shrink-0 text-brand" />
                    )}
                    <span className="text-sm font-semibold text-ink">
                        {DOCUMENT_TYPE_LABELS[document.type]}
                    </span>
                </button>
            ))}
        </div>
    )
}
