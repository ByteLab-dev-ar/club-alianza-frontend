import { useState } from 'react'
import { FileCheck2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useReissueReceipt } from '../hooks/useCounter'

/** El backend exige 10 caracteres: se avisa acá en vez de dejar chocar el 400. */
const MIN_REASON_LENGTH = 10

interface Props {
    /** El UUID del recibo VIGENTE, tal como lo devuelve `verify/{code}`. */
    receiptId: string
    receiptNumber: number
    /** Para saltar al recibo nuevo apenas se emite. */
    onReissued: (verificationCode: string) => void
}

/**
 * Corregir un recibo (§5.10): anula el vigente y emite el reemplazo.
 *
 * **Es una sola operación, y por eso existe este diálogo aparte del de anular.**
 * Anular a secas deja al socio sin comprobante vigente; corregir lo reemplaza.
 * Son dos decisiones distintas del club y la pantalla no las puede presentar
 * como la misma, porque la diferencia la paga el socio.
 *
 * El texto aclara lo que más se malinterpreta: esto **no devuelve plata**. El
 * pago sigue aprobado y la cuota acreditada — lo que se corrige es el papel.
 */
export const ReissueReceiptDialog = ({
    receiptId,
    receiptNumber,
    onReissued,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')

    const { mutate: reissue, isPending } = useReissueReceipt()

    const trimmedReason = reason.trim()
    const canReissue = trimmedReason.length >= MIN_REASON_LENGTH && !isPending

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) setReason('')
            }}
        >
            <DialogTrigger asChild>
                {/* `outline` y no `hero`. Era el botón más fuerte del sistema
                    —el celeste con sombra, el que en toda la app marca "el
                    próximo paso"— para la acción que ANULA el recibo que se está
                    mirando. La pantalla ya decía por escrito que el papel va
                    antes que las acciones destructivas; el estilo decía lo
                    contrario y ganaba el estilo. */}
                <Button variant="outline">
                    <FileCheck2 /> Corregir recibo
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">
                        Corregir el recibo N° {receiptNumber}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                        Se emite un recibo nuevo y este queda anulado con el motivo. El papel
                        viejo sigue respondiendo si alguien lo escanea, así que quien lo tenga
                        en la mano va a ver que fue reemplazado.
                    </DialogDescription>
                </DialogHeader>

                {/* Lo que más se malinterpreta, y la razón por la que este
                    diálogo existe separado del de anular. */}
                <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                    Corregir <strong className="font-semibold text-ink">no devuelve plata</strong>:
                    el pago sigue registrado y la cuota acreditada. Si hay que devolver un
                    importe, eso se resuelve en la sede.
                </p>

                <div className="mt-4 grid gap-2">
                    <Label htmlFor="reissue-reason">Qué estaba mal</Label>
                    <Textarea
                        id="reissue-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ej. el recibo salió con el nombre de otro socio."
                        rows={3}
                        autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                        Al menos {MIN_REASON_LENGTH} caracteres. Queda en el recibo anulado.
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="hero"
                        disabled={!canReissue}
                        onClick={() =>
                            reissue(
                                { id: receiptId, reason: trimmedReason },
                                {
                                    onSuccess: (nuevo) => {
                                        setIsOpen(false)
                                        onReissued(nuevo.verificationCode)
                                    },
                                },
                            )
                        }
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Emitir el recibo nuevo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
