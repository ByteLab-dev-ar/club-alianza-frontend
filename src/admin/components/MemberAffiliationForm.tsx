import { useRef } from 'react'
import { CircleCheck, Clock, Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCalendarDate } from '@/lib/format'
import { IMAGE_OR_PDF_TYPES, validateUpload } from '@/shared/lib/file-validation'
import { notify } from '@/lib/notify'
import { deriveAffiliationFormStatus } from '../lib/affiliation-form-status'
import { useMemberDocuments, useUploadSignedAffiliationForm } from '../hooks/useMemberDocuments'

/** El bloque de estado: cómo está firmada, en una línea que se lee de un vistazo. */
const StatusNote = ({
    tone,
    title,
    detail,
}: {
    tone: 'done' | 'pending'
    title: string
    detail: string
}) => (
    <div
        className={
            tone === 'done'
                ? 'flex items-start gap-2.5 rounded-lg bg-success/10 p-3'
                : 'flex items-start gap-2.5 rounded-lg bg-warning/10 p-3'
        }
    >
        {tone === 'done' ? (
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
        ) : (
            <Clock className="mt-0.5 size-5 shrink-0 text-warning" />
        )}
        <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{detail}</p>
        </div>
    </div>
)

/**
 * La ficha de afiliación en la ficha del socio: cómo está firmada, y el camino
 * del papel (§1.4).
 *
 * Va abajo del listado de documentos y no adentro porque contesta otra
 * pregunta. El listado dice **qué archivos hay**; esto dice **cómo está firmada
 * la ficha**, que es lo que trae quien está atendiendo al socio en el mostrador.
 * Una fila más en la lista no distingue el papel de la pantalla: las dos se ven
 * idénticas ahí.
 *
 * **El botón de cargar aparece solo si NO hay ficha, y no hay diálogo de
 * reemplazo.** El backend *puede* reemplazarla —su servicio es el único que
 * limpia los metadatos de la firma anterior—, pero eso es una capacidad del
 * servicio, no un caso de uso: §1.4 dice textual que nadie firma en pantalla y
 * después va a la sede a subir el mismo papel. Ofrecer el reemplazo invita a
 * borrar la constancia de una firma —fecha, IP, versión del texto, hash— sin
 * ninguna necesidad. Si algún día aparece un caso real de corrección, se diseña
 * ahí con su propia confirmación, como se hizo con "corregir recibo".
 *
 * Comparte la query con `MemberDocuments`, así que no es un pedido más: es la
 * misma entrada del cache.
 */
export const MemberAffiliationForm = ({ memberId }: { memberId: string }) => {
    const { data: documents, isLoading, isError } = useMemberDocuments(memberId, true)
    const { mutate: uploadForm, isPending } = useUploadSignedAffiliationForm(memberId)
    const inputRef = useRef<HTMLInputElement>(null)

    const onFileSelected = (file: File | undefined) => {
        if (!file) return

        // Imagen o PDF, y los dos hacen falta: el celular saca foto y el escáner
        // de la sede saca PDF por default. Mismo tope que el backend.
        const error = validateUpload(file, {
            types: IMAGE_OR_PDF_TYPES,
            typesLabel: 'imágenes JPG, PNG o WebP, o archivos PDF',
        })

        if (error) {
            notify.error(error)
            return
        }

        uploadForm(file)
    }

    /*
     * Sin datos no se dice nada, y el error importa más que la carga: sin esta
     * salida, una consulta fallida deja `documents` en undefined, el estado cae
     * en "todavía no firmó" y el panel ofrece cargar la ficha de un socio que
     * capaz ya la tiene. El listado de arriba ya avisa que no pudo cargar.
     */
    if (isLoading || isError) return null

    const status = deriveAffiliationFormStatus(documents)

    return (
        <>
            <Separator className="my-4" />

            {status.kind === 'screen' && (
                <StatusNote
                    tone="done"
                    title={`Firmada en pantalla el ${formatCalendarDate(status.signedAt)}`}
                    detail="Quedó registrada la fecha, la versión del texto y la huella del PDF."
                />
            )}

            {/* Que no tenga fecha de firma no es un dato que falte, y conviene
                decirlo donde se lo va a extrañar: el trazo nunca pasó por el
                sistema, así que lo único que el club puede fechar es el
                archivo. */}
            {status.kind === 'paper' && (
                <StatusNote
                    tone="done"
                    title="Firmada en papel"
                    detail="El original quedó en la sede. No hay fecha de firma porque se firmó fuera del sistema."
                />
            )}

            {status.kind === 'missing' && (
                <>
                    <StatusNote
                        tone="pending"
                        title="Todavía no firmó la ficha"
                        detail="Puede firmarla desde su cuenta, o traerla firmada en papel a la sede."
                    />

                    <Button
                        variant="dark"
                        className="mt-4"
                        disabled={isPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : <Upload />}
                        Cargar la ficha firmada en papel
                    </Button>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        JPG, PNG, WebP o PDF, hasta 5 MB.{' '}
                        <span className="font-semibold text-ink">
                            El club se queda con el papel
                        </span>
                        : lo que se archiva es una copia.
                    </p>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(event) => {
                            onFileSelected(event.target.files?.[0])
                            // Se limpia para que volver a elegir el MISMO
                            // archivo —después de un error— dispare el change
                            // otra vez.
                            event.target.value = ''
                        }}
                    />
                </>
            )}
        </>
    )
}
