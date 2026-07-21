import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { CheckCircle2, ShieldAlert, User, XCircle } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { ClubLogo } from '@/components/custom/ClubLogo'
import { validateCredentialAction } from '../actions/validate-credential.action'

export const ValidateCredentialPage = () => {
    const { token = '' } = useParams()

    const { data, isLoading, error } = useQuery({
        queryKey: ['credential-validation', token],
        queryFn: () => validateCredentialAction(token),
        enabled: !!token,
        retry: false,
    })

    const isThrottled = error instanceof AxiosError && error.response?.status === 429
    // Cualquier otro error del endpoint (400) significa credencial inválida:
    // token manipulado, vencido, o socio dado de baja.
    const isInvalid = !!error && !isThrottled

    return (
        <div className="mx-auto max-w-lg px-6 py-16">
            <div className="mb-8 flex justify-center">
                <ClubLogo />
            </div>

            {isLoading && <Skeleton className="h-72 rounded-2xl" />}

            {isThrottled && (
                <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
                    <ShieldAlert className="mx-auto size-12 text-warning" />
                    <h1 className="mt-4 font-display text-xl font-bold">Demasiados intentos</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Esperá unos segundos y volvé a escanear el código.
                    </p>
                </div>
            )}

            {isInvalid && (
                <div className="rounded-2xl border bg-card p-10 text-center shadow-soft">
                    <XCircle className="mx-auto size-12 text-destructive" />
                    <h1 className="mt-4 font-display text-xl font-bold">Credencial inválida</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Este código no corresponde a una credencial vigente del club.
                    </p>
                </div>
            )}

            {data && (
                <div className="overflow-hidden rounded-2xl border bg-card shadow-club">
                    <div
                        className={`flex items-center justify-center gap-2 py-4 text-white ${
                            data.isActive ? 'bg-success' : 'bg-destructive'
                        }`}
                    >
                        {data.isActive ? (
                            <CheckCircle2 className="size-5" />
                        ) : (
                            <XCircle className="size-5" />
                        )}
                        <span className="kicker">
                            {data.isActive ? 'Socio al día' : 'Cuota vencida'}
                        </span>
                    </div>

                    <div className="flex flex-col items-center gap-4 p-10">
                        {data.urlPhoto ? (
                            <img
                                src={data.urlPhoto}
                                alt={`Foto de ${data.name ?? 'socio'}`}
                                className="size-28 rounded-full border-4 border-accent object-cover"
                            />
                        ) : (
                            <span className="grid size-28 place-items-center rounded-full bg-accent text-brand">
                                <User className="size-12" />
                            </span>
                        )}

                        <div className="text-center">
                            <p className="font-display text-2xl font-extrabold text-ink">
                                {data.name} {data.surname}
                            </p>
                            {data.memberNumber && (
                                <p className="kicker mt-2 text-muted-foreground">
                                    Socio N° {data.memberNumber}
                                </p>
                            )}
                        </div>

                        <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
                            El estado se verifica en vivo contra el sistema del club en cada escaneo.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
