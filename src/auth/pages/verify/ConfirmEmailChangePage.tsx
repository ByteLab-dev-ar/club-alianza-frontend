import { Link, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/api/clubApi'
import { confirmEmailChangeAction } from '@/auth/actions/confirm-email-change.action'

/**
 * Ruta `/confirmar-email` — la fija el link que el backend manda al email NUEVO
 * cuando un socio pide cambiar su dirección (ver mail.service.ts).
 */
export const ConfirmEmailChangePage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') ?? ''

    const { isPending, isSuccess, error } = useQuery({
        queryKey: ['confirm-email-change', token],
        queryFn: () => confirmEmailChangeAction(token).then(() => true),
        enabled: !!token,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    })

    const isChecking = !!token && isPending

    return (
        <div className="text-center">
            {isChecking && (
                <>
                    <Loader2 className="mx-auto size-14 animate-spin text-brand" />
                    <h1 className="text-display mt-6 text-2xl text-ink">Confirmando el cambio…</h1>
                </>
            )}

            {isSuccess && (
                <>
                    <CheckCircle2 className="mx-auto size-14 text-success" />
                    <h1 className="text-display mt-6 text-2xl text-ink">Email actualizado</h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Tu cuenta ahora usa esta nueva dirección. Iniciá sesión con ella.
                    </p>
                    <Button asChild variant="hero" className="mt-8 w-full">
                        <Link to="/ingresar">Ingresar</Link>
                    </Button>
                </>
            )}

            {(!token || error) && (
                <>
                    <XCircle className="mx-auto size-14 text-destructive" />
                    <h1 className="text-display mt-6 text-2xl text-ink">No pudimos confirmarlo</h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {token
                            ? getApiErrorMessage(error, 'El link es inválido, venció o ya se usó.')
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
