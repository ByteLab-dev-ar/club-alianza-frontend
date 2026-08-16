import { Link, useNavigate, useSearchParams } from 'react-router'
import { AlertTriangle, Check, Loader2, ShieldQuestion } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/auth/store/auth.store'
import { formatCalendarDate } from '@/lib/format'
import {
    useAcceptGuardianInvitation,
    useGuardianInvitationPreview,
} from '../hooks/useGuardianInvitations'

/**
 * Aceptar una invitación a ser tutor (§2.3).
 *
 * La pantalla existe porque **sumar a alguien es hacerlo responsable de una
 * deuda**: antes del botón hay que decir de qué chicos sería tutor y qué
 * implica. Nadie queda de tutor por que otro le haya puesto el correo en un
 * formulario.
 *
 * El link llega por correo con el token en la query — lo arma `mail.service.ts`
 * del backend, así que este path no se puede renombrar de un solo lado.
 *
 * Es pública a propósito: quien la abre puede no tener cuenta todavía. Aceptar
 * sí exige sesión con ese mismo correo, que es la forma de probar que controla
 * la casilla a la que llegó la invitación.
 */
export const AcceptGuardianInvitationPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') ?? undefined
    const navigate = useNavigate()

    const status = useAuthStore((state) => state.status)
    const { data: invitation, isLoading, isError } = useGuardianInvitationPreview(token)
    const { mutate: accept, isPending } = useAcceptGuardianInvitation()

    if (!token) {
        return (
            <Shell>
                <p className="text-sm text-muted-foreground">
                    El enlace está incompleto. Volvé a abrirlo desde el correo que recibiste.
                </p>
            </Shell>
        )
    }

    if (isLoading || status === 'checking') {
        return (
            <Shell>
                <Skeleton className="h-40 rounded-xl" />
            </Shell>
        )
    }

    /*
     * Los tres motivos de fallo —no existe, ya se usó, venció— devuelven el
     * MISMO error del backend, y acá se muestran con el mismo texto por la misma
     * razón: distinguirlos le confirmaría a un tercero que ese token existió.
     */
    if (isError || !invitation) {
        return (
            <Shell>
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                    <div>
                        <p className="font-display font-bold text-ink">
                            Esta invitación ya no está disponible
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Las invitaciones vencen a las 72 horas. Pedile a quien te invitó que
                            te mande otra: para esa persona es un click.
                        </p>
                    </div>
                </div>
            </Shell>
        )
    }

    const wardList = invitation.wardNames.join(', ')

    return (
        <Shell>
            <p className="kicker text-brand">Invitación</p>
            <h1 className="text-display mt-2 text-2xl text-ink">
                {invitation.inviterName} te invita a ser tutor
            </h1>

            <div className="mt-6 rounded-xl border bg-accent/40 p-5">
                <p className="kicker text-muted-foreground">Serías tutor de</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">{wardList}</p>
            </div>

            {/* Lo que implica va ANTES del botón, no después ni en letra chica. */}
            <div className="mt-6 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                <p className="flex items-start gap-2.5">
                    <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-secondary" />
                    <span>
                        Aceptar te hace{' '}
                        <strong className="font-semibold text-ink">
                            responsable de la cuota
                        </strong>{' '}
                        de {invitation.wardNames.length === 1 ? 'ese chico' : 'esos chicos'}: el
                        club te la puede reclamar a vos igual que a quien te invitó.
                    </span>
                </p>
                <p className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <span>
                        Una vez aceptada{' '}
                        <strong className="font-semibold text-ink">
                            no se deshace desde la app
                        </strong>
                        : para sacar a un tutor hay que pedírselo al club.
                    </span>
                </p>
                <p className="text-xs">
                    Esta invitación vence el {formatCalendarDate(invitation.expiresAt)}.
                </p>
            </div>

            {status === 'authenticated' ? (
                <Button
                    variant="hero"
                    className="mt-7 w-full"
                    disabled={isPending}
                    onClick={() =>
                        accept(token, { onSuccess: () => void navigate('/mi-cuenta/chicos') })
                    }
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                    Acepto ser tutor
                </Button>
            ) : (
                <div className="mt-7 flex flex-col gap-3">
                    {/* Hay que entrar con la MISMA dirección a la que llegó la
                        invitación: es la forma de probar que se controla esa
                        casilla. Quien no tenga cuenta la crea con ese correo y
                        vuelve a este enlace. */}
                    <p className="text-sm text-muted-foreground">
                        Para aceptar, entrá con la cuenta del correo al que te llegó esta
                        invitación. Si no tenés una, creala con esa misma dirección y volvé acá.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="hero">
                            <Link to="/ingresar" state={{ from: `/invitaciones/tutor?token=${token}` }}>
                                Ingresar
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link to="/asociarse">Crear cuenta</Link>
                        </Button>
                    </div>
                </div>
            )}
        </Shell>
    )
}

const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="mx-auto w-full max-w-lg rounded-xl border bg-card p-8 shadow-soft">
        {children}
    </div>
)
