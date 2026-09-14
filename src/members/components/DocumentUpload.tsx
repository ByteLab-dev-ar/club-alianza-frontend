import { useRef, useState } from 'react'
import { Check, FileUp, Loader2, Lock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { validateUpload } from '@/shared/lib/file-validation'
import { cn } from '@/lib/utils'
import { formatCalendarDate } from '@/lib/format'
import { useMyDocuments } from '../hooks/useAffiliation'
import { useUploadDocument } from '../hooks/useProfile'
import { useUploadWardDocument, useWardDocuments } from '../hooks/useWards'
import {
    DOCUMENT_TYPE_LABELS,
    UPLOADABLE_DOCUMENT_TYPES,
    type UploadableDocumentType,
} from '../interfaces/MemberProfile'

// La ficha firmada de §1.4 no está acá a propósito: es un documento del socio
// pero no entra por `POST /members/documents` — tiene su propia pantalla, con
// los dos caminos de firma.
const DOCUMENTS: { type: UploadableDocumentType; label: string }[] = UPLOADABLE_DOCUMENT_TYPES.map(
    (type) => ({ type, label: DOCUMENT_TYPE_LABELS[type] }),
)

interface Props {
    /** La solicitud está en revisión: el endpoint responde 409 (§1.8). */
    frozen?: boolean
    /**
     * El trámite YA está aprobado: el DNI de un socio no se reemplaza desde el
     * portal (§1.6), el endpoint responde 409 y manda a la sede.
     *
     * ⚠️ **Es un prop y NO `useProfile()` adentro**, y la diferencia no es de
     * estilo: esta tarjeta también carga los documentos de un TUTELADO, y ahí el
     * estado que decide es el DEL CHICO, no el de quien está mirando la pantalla.
     * Un tutor ya socio cargándole el DNI a un hijo que todavía no lo es es el
     * caso normal de §2 — mirando el perfil propio, ese tutor quedaría bloqueado
     * y el tutelado ya aprobado seguiría con el botón muerto.
     */
    identityLocked?: boolean
    /** Presente = son los documentos de un TUTELADO, que van por otro endpoint. */
    wardId?: string
}

/**
 * Los documentos van a un bucket PRIVADO: el backend no devuelve URL y el socio
 * no puede volver a verlos (solo un admin). Por eso no hay preview — lo único
 * que se puede mostrar es que están y de cuándo son.
 *
 * Ese "de cuándo son" sale de `GET /members/documents`, y no del estado local de
 * esta pantalla: antes lo único que se sabía era lo que se había subido en esta
 * misma visita, así que al recargar la persona no tenía forma de saber si el DNI
 * había entrado.
 */
export const DocumentUpload = ({ frozen = false, identityLocked = false, wardId }: Props) => {
    const [pendingType, setPendingType] = useState<UploadableDocumentType | null>(null)
    const inputRefs = useRef<Partial<Record<UploadableDocumentType, HTMLInputElement | null>>>({})

    // Los cuatro hooks se llaman siempre y se elige el par que corresponde: las
    // reglas de hooks no permiten condicionarlos, y las queries del lado que no
    // se usa quedan deshabilitadas por su propio `enabled`.
    const myDocuments = useMyDocuments()
    const wardDocuments = useWardDocuments(wardId)
    const selfUpload = useUploadDocument()
    const wardUpload = useUploadWardDocument(wardId ?? '')

    const { data: documents = [] } = wardId ? wardDocuments : myDocuments
    const { mutate, isPending } = wardId ? wardUpload : selfUpload

    const onFileSelected = (type: UploadableDocumentType, file: File | undefined) => {
        if (!file) return

        const error = validateUpload(file)
        if (error) {
            toast.error(error)
            return
        }

        setPendingType(type)
        mutate({ type, file }, { onSettled: () => setPendingType(null) })
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                Tus documentos se guardan en un espacio privado. Nadie más que el club puede verlos,
                y ni siquiera vos podés volver a descargarlos desde acá.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                {DOCUMENTS.map(({ type, label }) => {
                    const isUploading = isPending && pendingType === type
                    const uploaded = documents.find((document) => document.type === type)

                    return (
                        <div
                            key={type}
                            className={cn(
                                'rounded-xl border p-5',
                                uploaded && 'border-success/40 bg-success/5',
                            )}
                        >
                            <p className="font-semibold text-ink">{label}</p>

                            {/*
                             * La confirmación tiene que quedar EN la tarjeta, no
                             * en un toast: el archivo va a un bucket privado y el
                             * socio no puede volver a verlo, así que esto es lo
                             * único que le responde "¿entró o no?". Y la fecha
                             * viene del servidor —no de lo que pasó en esta
                             * pantalla—, que es lo que la vuelve una prueba.
                             */}
                            {uploaded ? (
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-success">
                                    <Check className="size-3.5 shrink-0" />
                                    Subido el {formatCalendarDate(uploaded.updatedAt)}
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Todavía no lo subiste
                                </p>
                            )}

                            {/*
                             * Con el trámite aprobado no va un botón deshabilitado
                             * sino el motivo: un botón gris no explica nada, y acá
                             * hay algo concreto que la persona puede hacer.
                             *
                             * Los dos textos dicen cosas distintas a propósito. Con
                             * el documento cargado, el club ya lo verificó y
                             * reemplazarlo es un trámite. Sin documento —el socio
                             * del padrón histórico— no hay nada verificado: lo que
                             * falta es cargarlo, y eso también pasa por la sede.
                             */}
                            {identityLocked ? (
                                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                                    <Lock className="mt-0.5 size-3.5 shrink-0" />
                                    {uploaded
                                        ? 'Ya lo verificó el club. Si cambiaste de documento, acercate a la sede.'
                                        : 'El DNI de un socio se carga en la sede. Acercate y lo suben ellos.'}
                                </p>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    disabled={frozen || isUploading}
                                    onClick={() => inputRefs.current[type]?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="animate-spin" />
                                    ) : uploaded ? (
                                        <RefreshCw />
                                    ) : (
                                        <FileUp />
                                    )}
                                    {uploaded ? 'Reemplazar' : 'Subir archivo'}
                                </Button>
                            )}

                            <input
                                ref={(element) => {
                                    inputRefs.current[type] = element
                                }}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    onFileSelected(type, event.target.files?.[0])
                                    event.target.value = ''
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
