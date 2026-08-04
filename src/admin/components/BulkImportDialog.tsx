import { useRef, useState } from 'react'
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Send, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { CSV_TYPES, validateUpload } from '@/shared/lib/file-validation'
import { useBulkImport } from '../hooks/useBulkImport'

/** El padrón completo son ~3500 filas de texto: con 10MB sobra de sobra. */
const MAX_CSV_SIZE = 10 * 1024 * 1024

/**
 * Encabezados que lee el importador, en orden. Copia de lo que arma el DTO en
 * `AdminMembersService.processImportRows`: cualquier otra columna se ignora, y
 * un encabezado mal escrito hace que ese dato no entre sin avisar.
 */
const CSV_HEADERS = [
    'email',
    'name',
    'surname',
    'cuil',
    'dni',
    'phone',
    'address',
    'bornDate',
    'memberNumber',
    'expirationDate',
    'memberSince',
] as const

/** Una fila de ejemplo, para que se vea el formato de fechas y del CUIL. */
const CSV_SAMPLE_ROW = [
    'socio@email.com',
    'Ana',
    'Gomez',
    '27-12345678-0',
    '38452119',
    '+54 9 299 415 2012',
    'C.H Rodriguez 26',
    '1990-05-14',
    '00482',
    '2026-12-31',
    '2020-01-01',
]

/**
 * Marca de orden de bytes. Va al principio del CSV a propósito: sin ella Excel
 * lo abre con la codificación del sistema y los acentos salen rotos.
 *
 * Se construye con `fromCharCode` en vez de pegar el carácter: en el fuente es
 * invisible, y el lint lo rechaza como espacio irregular.
 */
const BOM = String.fromCharCode(0xfeff)

/**
 * Descarga una plantilla con los encabezados exactos y una fila de ejemplo.
 *
 * Con 250 filas, transcribir los nombres de columna a mano desde un párrafo es
 * una fuente de error garantizada: alcanza con escribir "CUIL" en mayúscula o
 * "fechaNacimiento" para que esa columna entera se pierda en silencio.
 */
const downloadTemplate = () => {
    const csv = BOM + [CSV_HEADERS.join(','), CSV_SAMPLE_ROW.join(','), ''].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))

    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla-socios.csv'
    link.click()

    URL.revokeObjectURL(url)
}

export const BulkImportDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const {
        startImport,
        reset,
        job,
        isUploading,
        isProcessing,
        isDone,
        error,
        retryEmails,
        isRetryingEmails,
        hasRetriedEmails,
    } = useBulkImport()

    // El backend cuenta las filas al subir, así que el % es fiable desde el arranque.
    const processed = job ? job.importedCount + job.failedCount : 0
    const total = job?.totalRows ?? 0
    const percent = total > 0 ? Math.round((processed / total) * 100) : isProcessing ? 5 : 0

    const closeAndReset = () => {
        setIsOpen(false)
        setFile(null)
        reset()
    }

    const onConfirm = () => {
        if (!file) {
            toast.error('Elegí un archivo CSV')
            return
        }
        startImport(file)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                // No se puede cerrar mientras procesa: antes el comentario lo
                // decía pero setIsOpen corría igual, así que con Escape o un
                // clic afuera el diálogo se cerraba y el admin perdía de vista
                // una importación en curso.
                if (!open && isProcessing) return

                setIsOpen(open)
                // Al cerrar, limpiar para arrancar de cero la próxima vez.
                if (!open) closeAndReset()
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload /> Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        Alta masiva de socios
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Subí un CSV con encabezado. Columnas: <code>email</code>, <code>name</code>,{' '}
                        <code>surname</code> (obligatorias) y opcionalmente <code>cuil</code>,{' '}
                        <code>dni</code>, <code>phone</code>, <code>address</code>,{' '}
                        <code>bornDate</code>, <code>memberNumber</code>,{' '}
                        <code>expirationDate</code>, <code>memberSince</code>.
                    </DialogDescription>
                </DialogHeader>

                {/* El CUIL es el dato que identifica al socio y no puede repetirse;
                    el DNI sí, así que aclararlo evita cargar el padrón con la
                    columna equivocada y tener que rehacerlo. */}
                <div className="rounded-lg border border-secondary/40 bg-accent/50 p-3">
                    <p className="text-xs text-foreground">
                        El <strong>CUIL</strong> es el dato que identifica al socio: no se repite
                        entre dos personas. El <strong>DNI</strong> sí puede repetirse, así que es
                        solo un dato de contacto. Se acepta con guiones o sin ellos.
                    </p>
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto p-0"
                        onClick={downloadTemplate}
                    >
                        <Download /> Descargar plantilla CSV
                    </Button>
                </div>

                <div className="mt-4">
                    {/* Fase 1: elegir archivo */}
                    {!job && (
                        <div className="flex flex-col gap-4">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-muted-foreground transition-colors hover:border-secondary hover:text-foreground"
                            >
                                <FileSpreadsheet className="size-8" />
                                {file ? (
                                    <span className="font-semibold text-foreground">{file.name}</span>
                                ) : (
                                    <span className="text-sm">Hacé clic para elegir el archivo</span>
                                )}
                            </button>
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".csv,text/csv"
                                className="hidden"
                                onChange={(event) => {
                                    const selected = event.target.files?.[0]
                                    if (!selected) return

                                    const error = validateUpload(selected, {
                                        types: CSV_TYPES,
                                        typesLabel: 'archivos CSV',
                                        maxSize: MAX_CSV_SIZE,
                                    })
                                    if (error) {
                                        toast.error(error)
                                        event.target.value = ''
                                        return
                                    }

                                    setFile(selected)
                                }}
                            />

                            {error && (
                                <p className="text-sm text-destructive">
                                    {getApiErrorMessage(error, 'No pudimos iniciar la importación')}
                                </p>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={closeAndReset}>
                                    Cancelar
                                </Button>
                                <Button variant="hero" onClick={onConfirm} disabled={isUploading || !file}>
                                    {isUploading && <Loader2 className="animate-spin" />}
                                    Iniciar importación
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Fase 2: progreso */}
                    {job && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-ink">
                                        {isDone ? 'Importación completa' : 'Procesando…'}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {processed} / {total}
                                    </span>
                                </div>
                                <Progress value={percent} />
                            </div>

                            {/* El polling murió: avisar en vez de dejar "Procesando…" eterno. */}
                            {error && !isDone && (
                                <div className="rounded-lg bg-destructive/10 p-3 text-sm">
                                    <p className="font-semibold text-destructive">
                                        No pudimos consultar el progreso
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {getApiErrorMessage(error, 'Falló la conexión con el servidor.')}{' '}
                                        La importación puede seguir corriendo: reabrí este panel en un
                                        rato o revisá la lista de socios.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-success/10 p-3 text-center">
                                    <p className="text-display text-2xl text-success">
                                        {job.importedCount}
                                    </p>
                                    <p className="kicker text-muted-foreground">Importados</p>
                                </div>
                                <div className="rounded-lg bg-destructive/10 p-3 text-center">
                                    <p className="text-display text-2xl text-destructive">
                                        {job.failedCount}
                                    </p>
                                    <p className="kicker text-muted-foreground">Con error</p>
                                </div>
                            </div>

                            {/* Filas que fallaron (email duplicado, datos inválidos) */}
                            {job.errors.length > 0 && (
                                <div className="max-h-40 overflow-y-auto rounded-lg border">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-muted">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold">Fila</th>
                                                <th className="px-3 py-2 text-left font-semibold">Email</th>
                                                <th className="px-3 py-2 text-left font-semibold">Motivo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {job.errors.map((rowError) => (
                                                <tr key={`${rowError.row}-${rowError.email}`}>
                                                    <td className="px-3 py-2">{rowError.row}</td>
                                                    <td className="px-3 py-2">{rowError.email}</td>
                                                    <td className="px-3 py-2 text-destructive">
                                                        {rowError.reason}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Socios creados OK pero cuyo mail de bienvenida no salió.
                                El caso típico es que se haya agotado el cupo de correo a
                                mitad del import: los socios YA existen, lo único que
                                faltó fue avisarles. */}
                            {isDone && job.emailFailures.length > 0 && (
                                <div className="rounded-lg bg-warning/10 p-3">
                                    <p className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <X className="mt-0.5 size-3.5 shrink-0 text-warning" />
                                        <span>
                                            {job.emailFailures.length} socio(s) se crearon bien,
                                            pero no se les pudo enviar el mail de bienvenida. Sin
                                            ese mail no pueden configurar su contraseña.
                                        </span>
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={retryEmails}
                                        disabled={isRetryingEmails}
                                    >
                                        {isRetryingEmails ? (
                                            <>
                                                <Loader2 className="animate-spin" /> Reenviando…
                                            </>
                                        ) : (
                                            <>
                                                <Send /> Reintentar envíos
                                            </>
                                        )}
                                    </Button>
                                    {isRetryingEmails && (
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Podés cerrar esta ventana: el envío sigue en segundo
                                            plano.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Los pendientes llegaron a cero después de un reintento. */}
                            {isDone && job.emailFailures.length === 0 && hasRetriedEmails && (
                                <p className="flex items-start gap-2 rounded-lg bg-success/10 p-3 text-xs text-muted-foreground">
                                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                                    Se enviaron todos los correos de bienvenida pendientes.
                                </p>
                            )}

                            {(isDone || !!error) && (
                                <div className="flex items-center justify-between">
                                    {isDone ? (
                                        <p className="flex items-center gap-2 text-sm font-semibold text-success">
                                            <CheckCircle2 className="size-4" /> Listo
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    <Button variant="dark" onClick={closeAndReset}>
                                        Cerrar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
