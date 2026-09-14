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
import { useProfile } from '../hooks/useProfile'
import { useWards } from '../hooks/useWards'
import { CreateWardDialog } from '../components/CreateWardDialog'
import { useMyPayments } from '@/payments/hooks/useMyPayments'
import { PaymentStatuses, summarizeMonths } from '@/payments/interfaces/Payment'
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
    const { data: wards = [], isSuccess: hasLoadedWards } = useWards()

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

    /*
     * Los datos básicos que el socio puede cargar solo, desde su perfil.
     *
     * Es una lista LOCAL y no `missingRequirements`, y está bien que lo sea: esta
     * pantalla no decide si puede presentar nada —de eso se ocupa "Mi
     * afiliación" con la lista del servidor—, solo ofrece completar tres campos
     * que se editan acá al lado. Lo que sí se arregló es que nombre los que
     * faltan de verdad en vez de recitar los tres siempre.
     */
    const missingBasics = [
        profile.dni ? null : 'el DNI',
        profile.phone ? null : 'el teléfono',
        profile.address ? null : 'el domicilio',
    ].filter((item): item is string => item !== null)

    const listedBasics =
        missingBasics.length > 1
            ? `${missingBasics.slice(0, -1).join(', ')} y ${missingBasics.at(-1)}`
            : missingBasics[0]

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-5 lg:grid-cols-3">
                {/* La membresía y no "la cuota" a secas: es la única de las tres
                    coberturas que decide si entrás al club, y la que mira el
                    escáner de la puerta. */}
                <Stat
                    icon={CalendarClock}
                    label="Membresía"
                    value={
                        profile.membershipUntil ? formatCalendarDate(profile.membershipUntil) : '—'
                    }
                    /*
                     * Vencida se dice vencida. Con el texto fijo "Al día hasta",
                     * el socio que debe la cuota leía que estaba al día tres
                     * centímetros abajo del badge del encabezado que le decía lo
                     * contrario — el mismo perfil alimentando las dos cosas.
                     *
                     * La actividad y el seguro, más abajo en esta misma pantalla,
                     * ya distinguían; la membresía era la única que no cambiaba
                     * ni de texto al vencer.
                     *
                     * Lo que NO hace es insinuar que dejó de ser socio, que es
                     * otra cosa: la cuota vencida no lo saca del padrón.
                     */
                    hint={
                        profile.membershipUntil
                            ? profile.isActive
                                ? `Al día hasta ${formatCalendarDate(profile.membershipUntil, 'MMMM yyyy')}`
                                : `Venció en ${formatCalendarDate(profile.membershipUntil, 'MMMM yyyy')}`
                            : 'Sin vencimiento registrado'
                    }
                />
                <Stat
                    icon={CircleCheck}
                    label="Último pago aprobado"
                    value={lastApproved ? formatPaymentMonth(summarizeMonths(lastApproved)) : '—'}
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

            {/*
             * La actividad y el seguro aparecen SOLO si alguna vez se pagaron, o
             * sea si la persona juega. A los cientos de socios que no juegan,
             * dos líneas en "—" les diría que les falta algo que no les
             * corresponde.
             *
             * Y vencidas no se pintan de rojo a propósito: ninguna de las dos
             * bloquea nada. Con la actividad vencida entrás al club igual y ves
             * los partidos; lo único que no podés es entrenar. El rojo está
             * reservado para la membresía, que es la que sí te deja afuera.
             */}
            {(profile.activityUntil || profile.insuranceUntil) && (
                <div className="flex flex-wrap gap-x-10 gap-y-4 rounded-xl border bg-card px-6 py-5 shadow-soft">
                    {profile.activityUntil && (
                        <div>
                            <p className="kicker text-muted-foreground">Actividad</p>
                            <p className="mt-1 text-sm font-medium text-ink">
                                {profile.isActivityUpToDate
                                    ? `Al día hasta el ${formatCalendarDate(profile.activityUntil)}`
                                    : `Venció el ${formatCalendarDate(profile.activityUntil)} · no podés entrenar hasta renovarla`}
                            </p>
                        </div>
                    )}

                    {profile.insuranceUntil && (
                        <div>
                            <p className="kicker text-muted-foreground">Seguro</p>
                            <p className="mt-1 text-sm font-medium text-ink">
                                {profile.isInsuranceUpToDate
                                    ? `Al día hasta el ${formatCalendarDate(profile.insuranceUntil)}`
                                    : `Venció el ${formatCalendarDate(profile.insuranceUntil)} · podés jugar igual, pero sin cobertura médica`}
                            </p>
                        </div>
                    )}
                </div>
            )}

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
                                    {formatPaymentMonth(summarizeMonths(payment))}
                                </p>
                                {/* Con el carrito, un comprobante puede cubrir a
                                    varias personas. Acá se nombran, porque el
                                    tutor necesita distinguir el pago de su hijo
                                    del propio en una lista de tres renglones. */}
                                {payment.lines.length > 1 && (
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                        {[
                                            ...new Set(
                                                payment.lines.map((line) => line.memberName),
                                            ),
                                        ].join(', ')}
                                    </p>
                                )}
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

            {/*
             * §2.2: "Cargar menores es algo que la app OFRECE, no un paso
             * obligatorio. El socio sin chicos nunca ve el trámite; al que sí, la
             * app se lo propone en vez de esconderlo en un menú."
             *
             * Por eso la propuesta vive acá, en la pantalla que el socio abre, y
             * no solo como un ítem del sidebar. Desaparece apenas tiene uno
             * cargado: ahí ya sabe dónde está.
             */}
            {hasLoadedWards && wards.length === 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-soft">
                    <div>
                        <p className="font-display font-bold text-ink">
                            ¿Tenés hijos para asociar?
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Podés afiliarlos desde tu cuenta, y si querés que jueguen, el club
                            les asigna su categoría.
                        </p>
                    </div>
                    <CreateWardDialog />
                </div>
            )}

            {/*
             * Una invitación, no un reclamo.
             *
             * Detrás de este bloque hay un socio: la pantalla entera vive detrás
             * del guard de socio, y tres tarjetas más arriba le muestra su número
             * y su antigüedad. Presentarle eso en ámbar, con un badge que decía
             * "Perfil incompleto", le contaba como falla algo que no lo es —el
             * padrón histórico entró sin documentos a propósito, para no dejar
             * afuera a quien era socio desde antes de que existiera la app—.
             *
             * "Mi afiliación" ya resolvía el mismo caso bien, con un kicker gris
             * y sin alarma; esto se le pone a tono.
             */}
            {missingBasics.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-soft">
                    <div>
                        <p className="font-display font-bold text-ink">
                            Podés terminar de cargar tus datos
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Nos falta {listedBasics}. No corre ningún plazo: seguís siendo socio
                            igual.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/mi-cuenta/perfil">Cargar mis datos</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
