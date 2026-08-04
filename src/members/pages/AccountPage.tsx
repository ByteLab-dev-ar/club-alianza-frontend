import { Link } from 'react-router'
import { differenceInYears } from 'date-fns'
import {
    ArrowRight,
    CalendarClock,
    CalendarDays,
    CircleCheck,
    Clock,
    QrCode,
    type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useProfile } from '../hooks/useProfile'
import { useMyPayments } from '@/payments/hooks/useMyPayments'
import { PaymentStatuses } from '@/payments/interfaces/Payment'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import { formatCalendarDate, formatMoney, formatPaymentMonth, parseCalendarDate } from '@/lib/format'

interface StatProps {
    label: string
    value: string
    hint: string
    icon: LucideIcon
}

const Stat = ({ label, value, hint, icon: Icon }: StatProps) => (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-3">
            <p className="kicker text-muted-foreground">{label}</p>
            <Icon className="size-4.5 shrink-0 text-secondary" />
        </div>
        <p className="text-display mt-3 text-2xl text-ink">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
)

const DataField = ({ label, value }: { label: string; value: string | null }) => (
    <div>
        <p className="kicker text-muted-foreground">{label}</p>
        <p className="mt-1 font-medium break-all text-ink">{value || '—'}</p>
    </div>
)

export const AccountPage = () => {
    const { data: profile, isLoading } = useProfile()
    const { data: payments = [] } = useMyPayments()

    // El backend no expone "último pago aprobado" — se deriva del historial propio.
    const lastApproved = payments
        .filter((payment) => payment.status === PaymentStatuses.APPROVED)
        .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
        .at(0)

    const recentPayments = [...payments]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3)

    if (isLoading || !profile) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid gap-5 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-36 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        )
    }

    const yearsAsMember = profile.memberSince
        ? differenceInYears(new Date(), parseCalendarDate(profile.memberSince))
        : null

    const isProfileIncomplete = !profile.dni || !profile.phone || !profile.address

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-5 lg:grid-cols-3">
                <Stat
                    icon={CalendarClock}
                    label="Próximo vencimiento"
                    value={
                        profile.expirationDate ? formatCalendarDate(profile.expirationDate) : '—'
                    }
                    hint={
                        profile.expirationDate
                            ? `Cuota ${formatCalendarDate(profile.expirationDate, 'MMMM yyyy')}`
                            : 'Sin vencimiento registrado'
                    }
                />
                <Stat
                    icon={CircleCheck}
                    label="Último pago aprobado"
                    value={lastApproved ? formatPaymentMonth(lastApproved.metadataMonth) : '—'}
                    hint={
                        lastApproved
                            ? formatMoney(lastApproved.amount)
                            : 'Todavía no tenés pagos aprobados'
                    }
                />
                <Stat
                    icon={CalendarDays}
                    label="Antigüedad"
                    value={yearsAsMember !== null ? `${yearsAsMember} años` : '—'}
                    hint={
                        profile.memberSince
                            ? `Desde ${formatCalendarDate(profile.memberSince)}`
                            : 'Sin fecha de alta registrada'
                    }
                />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                <div className="flex flex-col rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">Datos personales</h2>

                    <div className="mt-5 grid flex-1 gap-5 sm:grid-cols-2">
                        <DataField label="DNI" value={profile.dni} />
                        <DataField label="Email" value={profile.email} />
                        <DataField label="Teléfono" value={profile.phone} />
                        <DataField label="Domicilio" value={profile.address} />
                    </div>

                    <Button asChild variant="outline" className="mt-6 w-full">
                        <Link to="/mi-cuenta/perfil">
                            Editar datos <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <div className="bg-gradient-night flex flex-col justify-between rounded-xl p-7 shadow-club">
                    <div>
                        <p className="kicker text-secondary">Credencial digital</p>
                        <h2 className="text-display mt-3 text-2xl text-white">
                            Llevá tu socio en el celular
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                            Validación instantánea con QR, desde el teléfono.
                        </p>
                    </div>
                    <Button asChild variant="hero" className="mt-8 w-fit">
                        <Link to="/mi-cuenta/credencial">
                            <QrCode /> Ver credencial
                        </Link>
                    </Button>
                </div>
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

                <div className="mt-2 flex flex-col divide-y">
                    {recentPayments.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Todavía no cargaste ningún comprobante.
                        </p>
                    )}

                    {recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between gap-4 py-4">
                            <div className="min-w-0">
                                <p className="font-semibold text-ink">
                                    {formatPaymentMonth(payment.metadataMonth)}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="size-3" />
                                    {formatCalendarDate(payment.paymentDate)}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <span className="font-semibold">{formatMoney(payment.amount)}</span>
                                <PaymentStatusBadge status={payment.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isProfileIncomplete && (
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
