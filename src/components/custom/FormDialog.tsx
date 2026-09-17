import { type ReactNode, useState } from 'react'
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form'
import { Loader2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'

interface Props<T extends FieldValues> {
    form: UseFormReturn<T>
    /**
     * Valores iniciales, recalculados cada vez que se abre. Es una función y no
     * un objeto porque los diálogos de edición viven montados por fila: al
     * reabrirlos hay que volver a leer el registro, no quedarse con lo que se
     * tipeó la vez anterior.
     */
    buildDefaults: () => DefaultValues<T>
    /** Tiene que rechazar si falla: de eso depende que el diálogo NO se cierre. */
    onSubmit: (values: T) => Promise<unknown>
    title: string
    description?: ReactNode
    /** Botón que abre el diálogo. Sin esto, va uno de alta con el ícono +. */
    trigger?: ReactNode
    triggerLabel?: string
    submitLabel: string
    successMessage: string
    errorFallback: string
    isPending: boolean
    /** Para los formularios largos, que necesitan scroll propio. */
    contentClassName?: string
    children: ReactNode
}

/**
 * Esqueleto compartido de los formularios en diálogo del panel.
 *
 * Estaba copiado en seis componentes: el estado de apertura, el reset al abrir,
 * el try/catch con toast de éxito y de error, y el botón de submit con spinner.
 * Cada cambio de comportamiento —como el reset— había que aplicarlo seis veces
 * o quedaba inconsistente. Los diálogos ahora aportan solo su schema y campos.
 */
export const FormDialog = <T extends FieldValues>({
    form,
    buildDefaults,
    onSubmit,
    title,
    description,
    trigger,
    triggerLabel = 'Nuevo',
    submitLabel,
    successMessage,
    errorFallback,
    isPending,
    contentClassName = 'max-w-md',
    children,
}: Props<T>) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) form.reset(buildDefaults())
    }

    const handleSubmit = form.handleSubmit(async (values) => {
        try {
            await onSubmit(values)
            notify.success(successMessage)
            setIsOpen(false)
        } catch (error) {
            // Se queda abierto a propósito: así no se pierde lo que se cargó.
            notify.error(getApiErrorMessage(error, errorFallback))
        }
    })

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="hero">
                        <Plus /> {triggerLabel}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={contentClassName}>
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                        {children}

                        <Button
                            type="submit"
                            variant="hero"
                            className="mt-2"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            {submitLabel}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
