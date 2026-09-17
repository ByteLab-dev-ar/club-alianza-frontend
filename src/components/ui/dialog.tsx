import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close
const DialogTitle = DialogPrimitive.Title
const DialogDescription = DialogPrimitive.Description

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
                'data-[state=open]:animate-in data-[state=open]:fade-in-0',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                className,
            )}
            {...props}
        />
    )
}

function DialogContent({
    className,
    children,
    onPointerDownOutside,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    'fixed top-1/2 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2',
                    'rounded-xl border bg-card p-6 shadow-club',
                    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                    className,
                )}
                onPointerDownOutside={(event) => {
                    /*
                     * El toaster vive fuera del diálogo, así que para Radix
                     * tocar un toast es tocar AFUERA: con solo el
                     * pointer-events de index.css, la X cerraba el toast y
                     * también el formulario (probado con mouse real).
                     *
                     * `closest()` sirve aunque la X ya haya cerrado el toast:
                     * Radix difiere este aviso hasta el click, y sonner saca el
                     * <li> del DOM 200 ms después, así que el target sigue
                     * colgado del toaster.
                     *
                     * No alcanza sola: sin el onMouseDown de AppToaster, el
                     * foco se va a la X, el FocusScope se lo devuelve al input
                     * con select() y la tecla siguiente borra lo cargado.
                     */
                    const target = event.detail.originalEvent.target
                    if (target instanceof Element && target.closest('[data-sonner-toaster]')) {
                        event.preventDefault()
                    }
                    onPointerDownOutside?.(event)
                }}
                {...props}
            >
                {children}
                <DialogPrimitive.Close
                    className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Cerrar"
                >
                    <XIcon className="size-4" />
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
            {...props}
        />
    )
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
}
