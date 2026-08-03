import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { IMAGE_OR_PDF_TYPES, MAX_UPLOAD_SIZE } from '@/shared/lib/file-validation'
import { formatMonth } from '@/lib/format'
import { useCreatePayment, useNextDue } from '../hooks/useMyPayments'

const uploadPaymentSchema = z.object({
    // Libre a propósito: si el socio se atrasó, tesorería le dice por mensaje
    // cuánto pagar (p. ej. tres meses juntos) y sube UN comprobante por ese
    // total. No prellenar ni topear con el valor de la cuota.
    amount: z.coerce.number<number>().positive('Ingresá un monto válido'),
    paymentDate: z.string().min(1, 'Ingresá la fecha del pago'),
    file: z
        .instanceof(File, { message: 'Adjuntá el comprobante' })
        .refine((file) => file.size <= MAX_UPLOAD_SIZE, 'El archivo no puede superar los 5MB')
        .refine(
            (file) => IMAGE_OR_PDF_TYPES.includes(file.type),
            'Solo se aceptan imágenes (JPG, PNG, WebP) o PDF',
        ),
})

type UploadPaymentSchema = z.infer<typeof uploadPaymentSchema>

export const UploadPaymentDialog = () => {
    const [isOpen, setIsOpen] = useState(false)

    // El socio no elige el mes: lo decide el servidor y acá solo se muestra.
    const { data: nextDue } = useNextDue()

    const form = useForm<UploadPaymentSchema>({
        resolver: zodResolver(uploadPaymentSchema),
        defaultValues: {
            amount: undefined,
            paymentDate: new Date().toISOString().slice(0, 10),
        },
    })

    const { mutate, isPending } = useCreatePayment()

    return (
        <>
            {/* Deshabilitado hasta saber el período (y mientras haya un
                comprobante pendiente, en cuyo caso el aviso de la página
                explica el porqué). */}
            <Button
                variant="hero"
                onClick={() => setIsOpen(true)}
                disabled={nextDue?.canPay !== true}
            >
                <Upload /> Subir comprobante
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogTitle className="font-display text-xl font-bold">
                        Subir comprobante
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Cargá el comprobante de tu pago. Tesorería lo revisa y lo aprueba.
                    </DialogDescription>

                    {nextDue && (
                        <div className="mt-4 rounded-lg bg-accent px-4 py-3">
                            <p className="kicker text-accent-foreground/70">Estás pagando</p>
                            <p className="font-display text-lg font-bold text-accent-foreground">
                                {formatMonth(nextDue.month)}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-accent-foreground/70">
                                El período lo asigna el club: el siguiente se habilita cuando
                                este pago se apruebe. Si pagás varios meses juntos, subí un solo
                                comprobante por el total.
                            </p>
                        </div>
                    )}

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit((values) =>
                                mutate(
                                    {
                                        ...values,
                                        // Solo como verificación: si este período ya no
                                        // corresponde, el backend responde 409 (y el hook
                                        // refresca next-due para confirmar de nuevo).
                                        monthlyDueMonth: nextDue?.month,
                                    },
                                    {
                                        onSuccess: () => {
                                            form.reset()
                                            setIsOpen(false)
                                        },
                                    },
                                ),
                            )}
                            className="mt-6 flex flex-col gap-5"
                        >
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monto</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="8500"
                                                {...field}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha del pago</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="file"
                                // `field` trae value/onChange pensados para inputs de texto: un
                                // <input type="file"> es no controlado, así que solo enganchamos onChange.
                                render={({ field: { onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Comprobante</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                                className="py-2"
                                                onChange={(event) =>
                                                    onChange(event.target.files?.[0])
                                                }
                                                {...field}
                                                value={undefined}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" variant="hero" disabled={isPending}>
                                {isPending && <Loader2 className="animate-spin" />}
                                {isPending ? 'Subiendo…' : 'Enviar comprobante'}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}
