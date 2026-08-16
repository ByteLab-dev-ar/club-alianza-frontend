import { Link } from 'react-router'
import { ArrowRight, Clock, Trash2, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { formatCalendarDate } from '@/lib/format'
import { MEMBERSHIP_STATUS_LABELS, MembershipStatuses } from '../interfaces/MemberProfile'
import type { MemberProfile } from '../interfaces/MemberProfile'
import { useWards } from '../hooks/useWards'
import {
    useCancelGuardianInvitation,
    useMyGuardianInvitations,
} from '../hooks/useGuardianInvitations'
import { CreateWardDialog } from '../components/CreateWardDialog'
import { InviteGuardianDialog } from '../components/InviteGuardianDialog'

const WardCard = ({ ward }: { ward: MemberProfile }) => {
    const isMember = ward.membershipStatus === MembershipStatuses.MEMBER

    return (
        <Link
            to={`/mi-cuenta/chicos/${ward.id}`}
            className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-soft transition-colors hover:border-secondary"
        >
            {ward.urlPhoto ? (
                <img
                    src={ward.urlPhoto}
                    alt=""
                    className="size-14 shrink-0 rounded-full border-2 border-accent object-cover"
                />
            ) : (
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-brand">
                    <UserRound className="size-7" />
                </span>
            )}

            <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-ink">
                    {ward.name} {ward.surname}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {isMember && ward.memberNumber
                        ? `Socio N° ${ward.memberNumber}`
                        : MEMBERSHIP_STATUS_LABELS[ward.membershipStatus]}
                    {/* La categoría se muestra con la etiqueta que manda el
                        servidor y NO con una tabla local: es la nomenclatura del
                        club, y duplicarla acá alcanza para que el mismo chico
                        salga con dos nombres entre la ficha y la credencial. */}
                    {ward.isPlayer && ward.playerCategoryLabel
                        ? ` · Jugador — ${ward.playerCategoryLabel}`
                        : ward.isPlayer
                          ? ' · Jugador'
                          : ''}
                </p>
            </div>

            {/* Solo la membresía se pinta: es la única cobertura que bloquea. */}
            {isMember && (
                <Badge variant={ward.isActive ? 'success' : 'destructive'}>
                    {ward.isActive ? 'Al día' : 'Vencida'}
                </Badge>
            )}
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
    )
}

/**
 * "Mis chicos" (§2).
 *
 * > Un menor de edad es un socio completo. La única diferencia es que lo afilia
 * > otro, y que su cuota la paga otro.
 *
 * Cargar menores es algo que la app **ofrece**, no un paso obligatorio: el socio
 * que no tiene chicos nunca ve el trámite, y al que sí, la app se lo propone en
 * vez de esconderlo en un menú. De ahí el estado vacío, que es una invitación y
 * no un "no hay nada".
 */
export const WardsPage = () => {
    const { data: wards = [], isLoading } = useWards()
    const { data: invitations = [] } = useMyGuardianInvitations()
    const { mutateAsync: cancelInvitation } = useCancelGuardianInvitation()

    if (isLoading) return <Skeleton className="h-96 rounded-xl" />

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="kicker text-brand">A mi cargo</p>
                    <h1 className="text-display mt-2 text-3xl text-ink">Mis chicos</h1>
                </div>
                {wards.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <InviteGuardianDialog wards={wards} />
                        <CreateWardDialog />
                    </div>
                )}
            </div>

            {wards.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center shadow-soft">
                    <h2 className="font-display text-xl font-bold text-ink">
                        ¿Tenés hijos para asociar?
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                        Podés afiliarlos desde acá. Van a ser socios del club como cualquier
                        otro —con su ficha, su número y su credencial— y si querés que jueguen,
                        el club les asigna su categoría. Vos hacés el trámite y pagás su cuota.
                    </p>
                    <div className="mt-6">
                        <CreateWardDialog />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {wards.map((ward) => (
                        <WardCard key={ward.id} ward={ward} />
                    ))}
                </div>
            )}

            {invitations.length > 0 && (
                <section className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">
                        Invitaciones enviadas
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Todavía nadie las aceptó. Vencen a las 72 horas de enviadas; si vencen,
                        las volvés a mandar.
                    </p>

                    <ul className="mt-4 flex flex-col divide-y">
                        {invitations.map((invitation) => (
                            <li
                                key={invitation.id}
                                className="flex flex-wrap items-center justify-between gap-3 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-ink">
                                        {invitation.email}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        Vence el {formatCalendarDate(invitation.expiresAt)}
                                    </p>
                                </div>

                                <ConfirmDialog
                                    trigger={
                                        <Button variant="ghost" size="sm">
                                            <Trash2 /> Cancelar
                                        </Button>
                                    }
                                    title="Cancelar la invitación"
                                    description="Se puede porque todavía no pasó nada: nadie se hizo cargo de nada. Si ya la aceptaron, para sacar a un tutor hay que pedírselo al club."
                                    confirmLabel="Cancelar invitación"
                                    destructive
                                    onConfirm={async () => {
                                        await cancelInvitation(invitation.id)
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/*
             * No hay auto-baja de tutor (§2.3): poder deshacerlo con un click es
             * soltar una obligación de plata sin que nadie confirme quién queda a
             * cargo, y con dos tutores el que se va le deja el 100% al otro, que
             * no opinó. Lo que la app ofrece es pedirlo, no ejecutarlo.
             */}
            {wards.length > 0 && (
                <p className="rounded-xl border border-dashed p-5 text-sm leading-relaxed text-muted-foreground">
                    ¿Necesitás que te saquen como tutor de alguno de estos chicos? Eso lo hace
                    el club: escribinos desde{' '}
                    <Link to="/contacto" className="font-semibold text-secondary hover:underline">
                        Contacto
                    </Link>{' '}
                    y lo resolvemos. Un chico nunca puede quedar sin ningún tutor, así que hace
                    falta que haya otro en tu lugar.
                </p>
            )}
        </div>
    )
}
