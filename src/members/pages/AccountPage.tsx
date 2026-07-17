import { Link } from 'react-router'
import { differenceInYears } from 'date-fns'
import { ArrowRight, CalendarClock, CircleCheck, CircleX, Clock, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '../hooks/useProfile'
import { useMyPayments } from '@/payments/hooks/useMyPayments'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import { formatCalendarDate, formatMoney, parseCalendarDate } from '@/lib/format'

export const AccountPage = () => {
    const { data: profile, isLoading } = useProfile()
    const { data: payments = [] } = useMyPayments()

    // El backend no expone "último pago aprobado" — se deriva del historial propio.
    const lastApproved = payments
        .filter((payment) => payment.status === 'APPROVED')
        .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
        .at(0)

    const recentPayments = [...payments]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3)

    if (isLoading || !profile) {
        return (
            <div className="grid gap-6 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-32 rounded-xl" />
                ))}
            </div>
        )
    }

    const yearsAsMember = profile.memberSince
        ? differenceInYears(new Date(), parseCalendarDate(profile.memberSince))
        : null

    return (
        <div className="flex flex-col gap-8">
            <div>
                <p className="kicker text-secondary">Portal del socio</p>
                <h1 className="text-display mt-2 text-3xl text-ink">
                    Hola{profile.name ? `, ${profile.name}` : ''}
                </h1>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <p className="kicker text-muted-foreground">Estado de la cuota</p>
                    <div className="mt-3 flex items-center gap-2">
                        {profile.isActive ? (
                            <CircleCheck className="size-6 text-success" />
                        ) : (
                            <CircleX className="size-6 text-destructive" />
                        )}
                        <span className="font-display text-xl font-bold text-ink">
                            {profile.isActive ? 'Al día' : 'Vencida'}
                        </span>
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarClock className="size-4" />
                        {profile.expirationDate
                            ? `Vence el ${formatCalendarDate(profile.expirationDate)}`
                            : 'Sin vencimiento registrado'}
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <p className="kicker text-muted-foreground">Último pago aprobado</p>
                    {lastApproved ? (
                        <>
                            <p className="text-display mt-3 text-2xl text-ink">
                                {formatMoney(lastApproved.amount)}
                            </p>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {lastApproved.metadataMonth ?? 'Cuota'} ·{' '}
                                {formatCalendarDate(lastApproved.paymentDate)}
                            </p>
                        </>
                    ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Todavía no tenés pagos aprobados.
                        </p>
                    )}
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <p className="kicker text-muted-foreground">Antigüedad</p>
                    <p className="text-display mt-3 text-2xl text-ink">
                        {yearsAsMember !== null ? `${yearsAsMember} años` : '—'}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {profile.memberSince
                            ? `Socio desde ${formatCalendarDate(profile.memberSince, "MMMM 'de' yyyy")}`
                            : 'Sin fecha de alta registrada'}
                    </p>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                <div className="flex flex-col justify-between rounded-xl bg-gradient-dark p-8 shadow-club">
                    <div>
                        <p className="kicker text-secondary">Credencial digital</p>
                        <h2 className="text-display mt-3 text-2xl text-white">
                            Llevá tu socio en el celular
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                            Acceso al estadio y validación instantánea con QR.
                        </p>
                    </div>
                    <Button asChild variant="hero" className="mt-8 w-fit">
                        <Link to="/mi-cuenta/credencial">
                            <QrCode /> Ver credencial
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-lg font-bold text-ink">Últimos pagos</h2>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/mi-cuenta/pagos">
                                Ver todo <ArrowRight />
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-4 flex flex-col divide-y">
                        {recentPayments.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Todavía no cargaste ningún comprobante.
                            </p>
                        )}

                        {recentPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between gap-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-ink">
                                        {payment.metadataMonth ?? 'Cuota'}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        {formatCalendarDate(payment.paymentDate)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="font-semibold">
                                        {formatMoney(payment.amount)}
                                    </span>
                                    <PaymentStatusBadge status={payment.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {!profile.dni && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-warning/40 bg-warning/10 p-6">
                    <div>
                        <Badge variant="warning">Perfil incompleto</Badge>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Te faltan datos (DNI, teléfono, domicilio) para completar tu ficha de
                            socio.
                        </p>
                    </div>
                    <Button asChild variant="dark">
                        <Link to="/mi-cuenta/perfil">Completar perfil</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
