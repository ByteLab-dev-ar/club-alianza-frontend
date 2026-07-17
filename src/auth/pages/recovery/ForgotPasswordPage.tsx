import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { forgotPasswordAction } from '@/auth/actions/password.actions'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '@/auth/schemas/register.schema'

export const ForgotPasswordPage = () => {
    const [isSent, setIsSent] = useState(false)

    const form = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (values: ForgotPasswordSchema) => forgotPasswordAction(values.email),
        onSuccess: () => setIsSent(true),
        onError: (error) => toast.error(getApiErrorMessage(error, 'No pudimos procesar el pedido')),
    })

    // El backend responde éxito exista o no la cuenta (anti-enumeración), así que
    // el mensaje es deliberadamente ambiguo: "si el correo existe…".
    if (isSent) {
        return (
            <div className="text-center">
                <MailCheck className="mx-auto size-14 text-success" />
                <h1 className="text-display mt-6 text-2xl text-ink">Revisá tu correo</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Si esa dirección corresponde a una cuenta del club, te enviamos un link para
                    crear una contraseña nueva.
                </p>
                <Button asChild variant="dark" className="mt-8 w-full">
                    <Link to="/ingresar">Volver a ingresar</Link>
                </Button>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-display text-3xl text-ink">Recuperar contraseña</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Ingresá tu email y te mandamos un link para crear una nueva.
            </p>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((values) => mutate(values))}
                    className="mt-8 flex flex-col gap-5"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="tu@email.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="hero" size="lg" disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin" />}
                        {isPending ? 'Enviando…' : 'Enviar link'}
                    </Button>
                </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                <Link to="/ingresar" className="font-semibold text-secondary hover:underline">
                    Volver a ingresar
                </Link>
            </p>
        </div>
    )
}
