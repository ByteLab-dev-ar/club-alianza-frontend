import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { createPaymentAction } from '../actions/payments.actions'
import { MY_PAYMENTS_QUERY_KEY } from '../hooks/useMyPayments'
import { PROFILE_QUERY_KEY } from '@/members/hooks/useProfile'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const uploadPaymentSchema = z.object({
    amount: z.coerce.number<number>().positive('Ingresá un monto válido'),
    paymentDate: z.string().min(1, 'Ingresá la fecha del pago'),
    // El backend lo espera como YYYY-MM; un <input type="month"> ya da ese formato.
    monthlyDueMonth: z.string().optional(),
    file: z
        .instanceof(File, { message: 'Adjuntá el comprobante' })
        .refine((file) => file.size <= MAX_FILE_SIZE, 'El archivo no puede superar los 5MB')
        .refine(
            (file) => ACCEPTED_TYPES.includes(file.type),
            'Solo se aceptan imágenes (JPG, PNG, WebP) o PDF',
        ),
})

type UploadPaymentSchema = z.infer<typeof uploadPaymentSchema>

export const UploadPaymentDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<UploadPaymentSchema>({
        resolver: zodResolver(uploadPaymentSchema),
        defaultValues: {
            amount: undefined,
            paymentDate: new Date().toISOString().slice(0, 10),
            monthlyDueMonth: new Date().toISOString().slice(0, 7),
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: createPaymentAction,
        onSuccess: () => {
            toast.success('Comprobante enviado. Queda pendiente de aprobación.')
            // El pago entra en PENDING: todavía no cambia el estado de la cuota, pero
            // el perfil se refresca igual por si tesorería lo aprueba enseguida.
            void queryClient.invalidateQueries({ queryKey: MY_PAYMENTS_QUERY_KEY })
            void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
            form.reset()
            setIsOpen(false)
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'No pudimos subir el comprobante')),
    })

    return (
        <>
            <Button variant="hero" onClick={() => setIsOpen(true)}>
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

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit((values) => mutate(values))}
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
                                name="monthlyDueMonth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mes que pagás</FormLabel>
                                        <FormControl>
                                            <Input type="month" {...field} />
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
