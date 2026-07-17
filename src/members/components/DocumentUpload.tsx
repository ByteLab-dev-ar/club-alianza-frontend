import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Check, FileUp, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/api/clubApi'
import { uploadDocumentAction } from '../actions/profile.actions'
import { DocumentTypes, type DocumentType } from '../interfaces/MemberProfile'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const DOCUMENTS: { type: DocumentType; label: string }[] = [
    { type: DocumentTypes.DNI_FRONT, label: 'DNI — frente' },
    { type: DocumentTypes.DNI_BACK, label: 'DNI — dorso' },
]

/**
 * Los documentos van a un bucket PRIVADO: el backend no devuelve URL y el socio
 * no puede volver a verlos (solo un admin). Por eso no hay preview — lo único que
 * se puede mostrar es que la subida salió bien.
 */
export const DocumentUpload = () => {
    const [uploaded, setUploaded] = useState<Partial<Record<DocumentType, boolean>>>({})
    const [pendingType, setPendingType] = useState<DocumentType | null>(null)
    const inputRefs = useRef<Partial<Record<DocumentType, HTMLInputElement | null>>>({})

    const { mutate, isPending } = useMutation({
        mutationFn: ({ type, file }: { type: DocumentType; file: File }) =>
            uploadDocumentAction(type, file),
        onSuccess: (_data, variables) => {
            setUploaded((current) => ({ ...current, [variables.type]: true }))
            toast.success('Documento subido correctamente')
        },
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos subir el documento')),
        onSettled: () => setPendingType(null),
    })

    const onFileSelected = (type: DocumentType, file: File | undefined) => {
        if (!file) return

        if (file.size > MAX_FILE_SIZE) {
            toast.error('El archivo no puede superar los 5MB')
            return
        }

        setPendingType(type)
        mutate({ type, file })
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

                    return (
                        <div key={type} className="rounded-xl border p-5">
                            <p className="font-semibold text-ink">{label}</p>

                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                disabled={isUploading}
                                onClick={() => inputRefs.current[type]?.click()}
                            >
                                {isUploading ? (
                                    <Loader2 className="animate-spin" />
                                ) : uploaded[type] ? (
                                    <Check />
                                ) : (
                                    <FileUp />
                                )}
                                {uploaded[type] ? 'Subido — reemplazar' : 'Subir archivo'}
                            </Button>

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
