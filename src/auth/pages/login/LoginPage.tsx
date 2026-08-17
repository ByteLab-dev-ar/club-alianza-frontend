import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/custom/PasswordInput'
import { getApiErrorMessage } from '@/api/clubApi'
import { useAuthStore } from '@/auth/store/auth.store'
import { loginSchema, type LoginSchema } from '@/auth/schemas/login.schema'
import { GoogleButton } from '@/auth/components/GoogleButton'
import { homeRouteForRoles } from '@/router/home-route'

export const LoginPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const loginUser = useAuthStore((state) => state.loginUser)
    const sessionEndedMessage = useAuthStore((state) => state.sessionEndedMessage)

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (values: LoginSchema) => {
        try {
            const user = await loginUser(values.email, values.password)

            // Si el guard lo mandó acá desde una ruta privada, lo devolvemos ahí.
            const from = (location.state as { from?: string } | null)?.from
            navigate(from ?? homeRouteForRoles(user.roles), { replace: true })
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos iniciar sesión'))
        }
    }

    const { isSubmitting } = form.formState

    return (
        <div>
            {/* Va como banner y no como toast: cuando el backend detecta un
                refreshToken reusado cierra TODAS las sesiones, y este texto es
                la única explicación de por qué la persona terminó acá. Un toast
                de 4 segundos en medio de un redirect se pierde. */}
            {sessionEndedMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
                    <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-warning" />
                    <p className="text-sm leading-relaxed text-ink">{sessionEndedMessage}</p>
                </div>
            )}

            <h1 className="text-display text-3xl text-ink">Ingresá a tu cuenta</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Accedé a tu credencial digital y a tus datos de socio.
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
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
                                <div className="flex items-center justify-between">
                                    <FormLabel>Contraseña</FormLabel>
                                    <Link
                                        to="/recuperar-clave"
                                        className="text-xs font-semibold text-brand hover:underline"
                                    >
                                        ¿La olvidaste?
                                    </Link>
                                </div>
                                <FormControl>
                                    <PasswordInput
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="animate-spin" />}
                        {isSubmitting ? 'Ingresando…' : 'Ingresar'}
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
                ¿Todavía no sos socio?{' '}
                <Link to="/asociarse" className="font-semibold text-brand hover:underline">
                    Asociate
                </Link>
            </p>
        </div>
    )
}
