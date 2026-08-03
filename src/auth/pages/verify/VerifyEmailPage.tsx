import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { QK } from '@/api/queryKeys'
import { getApiErrorMessage } from '@/api/clubApi'
import { verifyEmailAction } from '@/auth/actions/verify-email.action'
import { useOneTimeToken } from '@/auth/hooks/useOneTimeToken'

/**
 * Ruta `/verificar-email` — la fija el link del mail de bienvenida
 * (`${FRONTEND_URL}/verificar-email?token=…`, ver mail.service.ts).
 * Esta página llama al endpoint y muestra el resultado; el usuario nunca ve el
 * JSON del backend.
 */
export const VerifyEmailPage = () => {
    const token = useOneTimeToken()

    const { isPending, isSuccess, error } = useQuery({
        queryKey: [QK.verifyEmail, token],
        queryFn: () => verifyEmailAction(token).then(() => true),
        enabled: !!token,
        retry: false,
        // El token se consume al usarlo: reintentar en un refetch daría "inválido".
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    })

    const isChecking = !!token && isPending

    return (
        <div className="text-center">
            {isChecking && (
                <>
                    <Loader2 className="mx-auto size-14 animate-spin text-brand" />
                    <h1 className="text-display mt-6 text-2xl text-ink">Verificando tu cuenta…</h1>
                </>
            )}

            {isSuccess && (
                <>
                    <CheckCircle2 className="mx-auto size-14 text-success" />
                    <h1 className="text-display mt-6 text-2xl text-ink">¡Cuenta verificada!</h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Tu correo quedó confirmado. Ya podés ingresar al portal del socio.
                    </p>
                    <Button asChild variant="hero" className="mt-8 w-full">
                        <Link to="/ingresar">Ingresar</Link>
                    </Button>
                </>
            )}

            {(!token || error) && (
                <>
                    <XCircle className="mx-auto size-14 text-destructive" />
                    <h1 className="text-display mt-6 text-2xl text-ink">No pudimos verificarte</h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {token
                            ? getApiErrorMessage(error, 'El link es inválido o ya venció.')
                            : 'Este link no tiene un token válido.'}
                    </p>
                    <Button asChild variant="dark" className="mt-8 w-full">
                        <Link to="/ingresar">Volver a ingresar</Link>
                    </Button>
                </>
            )}
        </div>
    )
}
