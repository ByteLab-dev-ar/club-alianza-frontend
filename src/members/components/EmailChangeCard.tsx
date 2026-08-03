import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, MailCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useRequestEmailChange } from '../hooks/useProfile'

const emailChangeSchema = z.object({
    newEmail: z.email('Ingresá un email válido'),
})

type EmailChangeSchema = z.infer<typeof emailChangeSchema>

interface Props {
    currentEmail: string
}

export const EmailChangeCard = ({ currentEmail }: Props) => {
    const form = useForm<EmailChangeSchema>({
        resolver: zodResolver(emailChangeSchema),
        defaultValues: { newEmail: '' },
    })

    const { mutate, isPending, isSuccess } = useRequestEmailChange()

    return (
        <div className="rounded-xl border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Cambiar email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Tu email actual es <strong className="text-foreground">{currentEmail}</strong>.
            </p>

            {/* El cambio NO se aplica al enviar: el backend manda un mail al email NUEVO
                y recién se aplica cuando se abre ese link. */}
            {isSuccess ? (
                <div className="mt-6 flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-4">
                    <MailCheck className="mt-0.5 size-5 shrink-0 text-success" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Te mandamos un correo a la dirección nueva. El cambio se aplica recién cuando
                        abrís el link de confirmación desde esa casilla.
                    </p>
                </div>
            ) : (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((values) =>
                            mutate(values.newEmail, { onSuccess: () => form.reset() }),
                        )}
                        className="mt-6 flex flex-col gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="newEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nuevo email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="nuevo@email.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            variant="outline"
                            className="w-fit"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            {isPending ? 'Enviando…' : 'Pedir cambio de email'}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}
