import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

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
import { useRejectPayment } from '../hooks/useAdminPayments'

interface Props {
    paymentId: string
    memberName: string
}

export const RejectPaymentDialog = ({ paymentId, memberName }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')
    const { mutateAsync, isPending } = useRejectPayment()

    const handleReject = async () => {
        try {
            await mutateAsync({ paymentId, reason: reason.trim() || undefined })
            toast.success('Pago rechazado')
            setIsOpen(false)
            setReason('')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos rechazar el pago'))
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                // Al abrir arranca limpio: sin esto, un motivo tipeado y
                // cancelado reaparecía en la próxima apertura.
                if (open) setReason('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                    <X /> Rechazar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">Rechazar pago</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Vas a rechazar el comprobante de {memberName}. El motivo es opcional, pero el
                        socio lo va a ver en su historial.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid gap-2">
                    <Label htmlFor="reject-reason">Motivo (opcional)</Label>
                    <Textarea
                        id="reject-reason"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ej. el comprobante no es legible o el monto no coincide."
                        maxLength={255}
                        rows={3}
                    />
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => void handleReject()}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Rechazar pago
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
