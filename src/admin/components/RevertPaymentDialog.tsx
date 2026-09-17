import { useState } from 'react'
import { Loader2, Undo2 } from 'lucide-react'

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
import { getApiErrorMessage } from '@/api/clubApi'
import { formatMoney } from '@/lib/format'
import { notify } from '@/lib/notify'
import { useRevertPayment } from '../hooks/useAdminPayments'

/** Lo pide el backend, y el motivo de que sea 10 y no 1 está en el copy. */
const MIN_REASON = 10
const MAX_REASON = 300

interface Props {
    paymentId: string
    memberName: string
    amount: number
    /** Para poder nombrar el papel que se va a anular. */
    receiptNumber?: number
}

/**
 * Revertir un pago aprobado: la plata volvió y hay que deshacer lo acreditado.
 *
 * **El diálogo no pregunta "¿estás seguro?".** Es la operación más destructiva
 * del panel —da de baja la cuota, recalcula la cobertura y anula un recibo que
 * puede estar impreso y en la mano de alguien—, así que lo que tiene que hacer
 * la confirmación es DECIR eso. Un "¿estás seguro?" se contesta que sí sin
 * leerlo.
 *
 * Solo se ofrece a ADMIN y solo sobre un pago aprobado: el backend responde 400
 * sobre uno pendiente, aclarando que ahí lo que corresponde es rechazarlo.
 */
export const RevertPaymentDialog = ({ paymentId, memberName, amount, receiptNumber }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')
    const { mutateAsync, isPending } = useRevertPayment()

    const trimmed = reason.trim()
    const isReasonValid = trimmed.length >= MIN_REASON

    const handleRevert = async () => {
        try {
            await mutateAsync({ paymentId, reason: trimmed })
            notify.success('Pago revertido')
            setIsOpen(false)
            setReason('')
        } catch (error) {
            notify.error(getApiErrorMessage(error, 'No pudimos revertir el pago'))
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) setReason('')
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                >
                    <Undo2 /> Revertir
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">
                        Revertir pago
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        El pago de {memberName} por {formatMoney(amount)} ya está acreditado.
                        Revertirlo lo deshace:
                    </DialogDescription>
                </DialogHeader>

                <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
                    <li>Da de baja la cuota que registró.</li>
                    {/* Esto es lo que más sorprende, así que se dice explícito:
                        acreditar se queda con la fecha más lejana, así que la
                        cobertura no es la suma de los meses pagados. */}
                    <li>
                        <strong className="text-foreground">Recalcula</strong> la cobertura de
                        cada persona: no le resta un mes, la vuelve a calcular con lo que
                        quede pago.
                    </li>
                    <li>
                        Anula el recibo
                        {receiptNumber !== undefined ? ` N° ${receiptNumber}` : ''}, que puede
                        estar circulando impreso. No se emite uno nuevo.
                    </li>
                </ul>

                <p className="mt-3 rounded-lg border border-dashed bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                    No es lo mismo que rechazar: rechazar es no acreditar, y solo se le puede
                    hacer a un pago pendiente. Si lo que está mal es el papel y no la plata,
                    lo que corresponde es corregir el recibo.
                </p>

                <div className="mt-4 grid gap-2">
                    <Label htmlFor="revert-reason">Por qué se revierte</Label>
                    <Textarea
                        id="revert-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ej. contracargo de Mercado Pago del 12/08: la plata volvió."
                        maxLength={MAX_REASON}
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                        {isReasonValid
                            ? `${trimmed.length}/${MAX_REASON}`
                            : `Mínimo ${MIN_REASON} caracteres: queda registrado y explica un recibo anulado.`}
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => void handleRevert()}
                        disabled={isPending || !isReasonValid}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Revertir pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
