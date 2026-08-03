import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getApiErrorMessage } from '@/api/clubApi'
import { registerAction } from '@/auth/actions/register.action'
import { registerSchema, type RegisterSchema } from '@/auth/schemas/register.schema'
import { GoogleButton } from '@/auth/components/GoogleButton'

export const RegisterPage = () => {
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

    const form = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', surname: '', email: '', password: '', confirmPassword: '' },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: registerAction,
        onSuccess: (_user, variables) => setRegisteredEmail(variables.email),
        onError: (error) => {
            // El email duplicado es el error más común de este formulario y el
            // backend lo devuelve como 409. Marcarlo en el campo evita que la
            // persona tenga que adivinar cuál de los cinco campos rechazó. El
            // texto sale del backend, que ya lo manda en español.
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                form.setError('email', {
                    message: getApiErrorMessage(error, 'Ya existe una cuenta con este email'),
                })
                return
            }
            toast.error(getApiErrorMessage(error, 'No pudimos crear tu cuenta'))
        },
    })

    // El usuario queda inactivo hasta verificar el mail: no se lo loguea acá.
    if (registeredEmail) {
        return (
            <div className="text-center">
                <CheckCircle2 className="mx-auto size-14 text-success" />
                <h1 className="text-display mt-6 text-2xl text-ink">Revisá tu correo</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Te mandamos un mail a <strong className="text-foreground">{registeredEmail}</strong>{' '}
                    con un link para verificar tu cuenta. Una vez verificada vas a poder ingresar al
                    portal y completar tus datos de socio.
                </p>
                <Button asChild variant="dark" className="mt-8 w-full">
                    <Link to="/ingresar">Ir a ingresar</Link>
                </Button>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-display text-3xl text-ink">Asociate al club</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Creá tu cuenta para empezar. Después vas a poder completar tus datos (DNI, teléfono,
                domicilio) desde tu perfil.
            </p>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((values) =>
                        mutate({
                            name: values.name,
                            surname: values.surname,
                            email: values.email,
                            password: values.password,
                        }),
                    )}
                    className="mt-8 flex flex-col gap-5"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="given-name" placeholder="Juan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="surname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellido</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="family-name" placeholder="Pérez" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Repetir contraseña</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="hero" size="lg" disabled={isPending}>
                        {isPending && <Loader2 className="animate-spin" />}
                        {isPending ? 'Creando cuenta…' : 'Crear cuenta'}
                    </Button>
                </form>
            </Form>

            <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="kicker text-muted-foreground">o</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <GoogleButton />

            <p className="mt-8 text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{' '}
                <Link to="/ingresar" className="font-semibold text-brand hover:underline">
                    Ingresá
                </Link>
            </p>
        </div>
    )
}
