import { FileText, Loader2 } from 'lucide-react'

import { useMemberDocuments } from '../hooks/useMemberDocuments'
import type { DocumentType } from '@/members/interfaces/MemberProfile'

const DOCUMENT_LABELS: Record<DocumentType, string> = {
    DNI_FRONT: 'DNI — frente',
    DNI_BACK: 'DNI — dorso',
}

interface Props {
    memberId: string
}

/**
 * Documentos privados del socio. Solo ADMIN puede verlos, y cada uno viene con
 * una URL firmada de 5 minutos (no la URL pública permanente).
 */
export const MemberDocuments = ({ memberId }: Props) => {
    const { data: documents, isLoading, isError } = useMemberDocuments(memberId, true)

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
            {documents.map((document) => (
                <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-secondary hover:bg-accent"
                >
                    <FileText className="size-5 text-brand" />
                    <span className="text-sm font-semibold text-ink">
                        {DOCUMENT_LABELS[document.type]}
                    </span>
                </a>
            ))}
        </div>
    )
}
