import { useState } from 'react'
import { Ban, Loader2 } from 'lucide-react'

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
import { useVoidReceipt } from '../hooks/useCounter'

/** El backend exige 10 caracteres: se avisa acá en vez de dejar chocar el 400. */
const MIN_REASON_LENGTH = 10

interface Props {
    /** El UUID del recibo, tal como lo devuelve `verify/{code}`. */
    receiptId: string
    receiptNumber: number
}

/**
 * Anular un recibo (§5.10).
 *
 * No lo borra: el papel sigue circulando y tiene que poder responder qué le
 * pasó. Por eso el motivo es obligatorio — lo lee el próximo que escanee el
 * código, y sin él la respuesta es "anulado" y nada más.
 *
 * **Una corrección emite un recibo NUEVO.** El viejo nunca se reescribe, así
 * que el texto lo dice antes de confirmar: quien anula para corregir un importe
 * tiene que saber que después le falta cobrar de nuevo.
 */
export const VoidReceiptDialog = ({ receiptId, receiptNumber }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')

    const { mutate: voidReceipt, isPending } = useVoidReceipt()

    const trimmedReason = reason.trim()
    const canVoid = trimmedReason.length >= MIN_REASON_LENGTH && !isPending

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                // Al abrir arranca limpio: un motivo tipeado y cancelado no
                // tiene por qué reaparecer sobre otro recibo.
                if (open) setReason('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                    <Ban /> Anular recibo
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">
                        Anular el recibo N° {receiptNumber}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                        El recibo no se borra: queda como anulado y quien lo escanee va a leer
                        este motivo. Si hay que corregir algo, se emite un recibo nuevo — este
                        no se reescribe.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid gap-2">
                    <Label htmlFor="void-reason">Motivo</Label>
                    <Textarea
                        id="void-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ej. se cobró de más y se emite un recibo nuevo por el importe correcto."
                        rows={3}
                        autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                        Al menos {MIN_REASON_LENGTH} caracteres.
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Volver
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={!canVoid}
                        onClick={() =>
                            voidReceipt(
                                { id: receiptId, reason: trimmedReason },
                                { onSuccess: () => setIsOpen(false) },
                            )
                        }
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Anular recibo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
