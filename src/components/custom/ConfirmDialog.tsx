import { type ReactNode, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface Props {
    trigger: ReactNode
    title: string
    description: ReactNode
    confirmLabel?: string
    /** Rojo para acciones destructivas (borrar, rechazar). */
    destructive?: boolean
    /** Puede ser async: el diálogo muestra spinner y se cierra al resolver. */
    onConfirm: () => void | Promise<void>
}

/**
 * Confirmación reutilizable montada sobre Dialog (no hay alert-dialog instalado).
 * Maneja su propio estado de apertura y el loading del confirm.
 */
export const ConfirmDialog = ({
    trigger,
    title,
    description,
    confirmLabel = 'Confirmar',
    destructive = false,
    onConfirm,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const handleConfirm = async () => {
        setIsPending(true)
        try {
            await onConfirm()
            setIsOpen(false)
        } catch {
            // El hook de la mutación es el que avisa del error con un toast. Acá
            // solo hace falta no cerrar el diálogo y no dejar el rechazo suelto:
            // sin este catch, un borrado fallido quedaba como unhandled rejection
            // y el diálogo se cerraba como si hubiera salido bien.
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogTitle className="font-display text-lg font-bold">{title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    {description}
                </DialogDescription>
                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={() => void handleConfirm()}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
