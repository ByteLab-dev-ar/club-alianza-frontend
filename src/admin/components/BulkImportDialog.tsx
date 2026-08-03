import { useRef, useState } from 'react'
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react'
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

export const BulkImportDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const { startImport, reset, job, isUploading, isProcessing, isDone, error } = useBulkImport()

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
                        <code>surname</code> (obligatorias) y opcionalmente <code>dni</code>,{' '}
                        <code>phone</code>, <code>address</code>, <code>bornDate</code>,{' '}
                        <code>memberNumber</code>, <code>expirationDate</code>, <code>memberSince</code>.
                    </DialogDescription>
                </DialogHeader>

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

                            {/* Socios creados OK pero cuyo mail de bienvenida no salió */}
                            {isDone && job.emailFailures.length > 0 && (
                                <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-muted-foreground">
                                    <X className="mt-0.5 size-3.5 shrink-0 text-warning" />
                                    {job.emailFailures.length} socio(s) se crearon pero su mail de
                                    bienvenida no se pudo enviar. Habrá que reenviarlo manualmente.
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
