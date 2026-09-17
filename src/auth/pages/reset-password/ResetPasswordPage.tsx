import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PasswordInput } from '@/components/custom/PasswordInput'
import { getApiErrorMessage } from '@/api/clubApi'
import { resetPasswordAction } from '@/auth/actions/password.actions'
import { useOneTimeToken } from '@/auth/hooks/useOneTimeToken'
import { useAuthStore } from '@/auth/store/auth.store'
import { resetPasswordSchema, type ResetPasswordSchema } from '@/auth/schemas/password.schema'
import { notify } from '@/lib/notify'

/**
 * Ruta `/reset-password` — el path lo fija el link que manda el backend por mail
 * (`${FRONTEND_URL}/reset-password?token=…`), así que no se puede renombrar sin
 * tocar mail.service.ts.
 *
 * Sirve para dos casos con el mismo token: recuperar una contraseña olvidada y
 * definir la primera contraseña de un socio dado de alta por un admin.
 */
export const ResetPasswordPage = () => {
    const navigate = useNavigate()
    const token = useOneTimeToken()
    const clearSession = useAuthStore((state) => state.clearSession)

    const form = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (values: ResetPasswordSchema) => resetPasswordAction(token, values.newPassword),
        onSuccess: () => {
            // El backend revoca TODAS las sesiones al resetear, incluida la de
            // este dispositivo: esta pantalla vive fuera del guard de
            // no-autenticado justamente para poder usarse con la sesión abierta.
            //
            // Sin limpiar acá, /ingresar (que sí está detrás de
            // NotAuthenticatedRoutes) ve status 'authenticated' y rebota al panel
            // del rol, con las cookies ya muertas y el cache lleno de datos
            // personales, hasta que la primera request 401ee. Va ANTES del
            // navigate: zustand aplica el set sincrónicamente, así el guard ya
            // ve 'not-authenticated' cuando renderiza la ruta.
            clearSession()
            notify.success('Contraseña actualizada. Iniciá sesión de nuevo.')
            navigate('/ingresar', { replace: true })
        },
        onError: (error) =>
            notify.error(getApiErrorMessage(error, 'No pudimos actualizar la contraseña')),
    })

    if (!token) {
        return (
            <div className="text-center">
                <TriangleAlert className="mx-auto size-14 text-warning-strong" />
                <h1 className="text-display mt-6 text-2xl text-ink">Link inválido</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Este link no tiene un token válido. Pedí uno nuevo desde "Recuperar contraseña".
                </p>
                <Button asChild variant="dark" className="mt-8 w-full">
                    <Link to="/recuperar-clave">Pedir link nuevo</Link>
                </Button>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-display text-3xl text-ink">Nueva contraseña</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Elegí una contraseña nueva para tu cuenta.
            </p>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((values) => mutate(values))}
                    className="mt-8 flex flex-col gap-5"
                >
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                    <PasswordInput
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
                                    <PasswordInput
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
                        {isPending ? 'Guardando…' : 'Guardar contraseña'}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
