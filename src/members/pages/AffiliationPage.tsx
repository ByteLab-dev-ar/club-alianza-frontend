import { Link } from 'react-router'
import { AlertTriangle, ArrowRight, Check, Clock, Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { cn } from '@/lib/utils'
import { formatCalendarDate } from '@/lib/format'
import {
    MEMBERSHIP_STATUS_LABELS,
    MembershipStatuses,
    DocumentTypes,
    type MembershipStatus,
} from '../interfaces/MemberProfile'
import { useProfile } from '../hooks/useProfile'
import {
    useCancelMembershipApplication,
    useMyDocuments,
    useSubmitMembershipApplication,
} from '../hooks/useAffiliation'
import { AffiliationChecklist } from '../components/AffiliationChecklist'
import { AffiliationFormCard } from '../components/AffiliationFormCard'

/** Los tres estados de §1.2, en el orden en que se recorren. */
const STEPS: MembershipStatus[] = [
    MembershipStatuses.REGISTERED,
    MembershipStatuses.PENDING,
    MembershipStatuses.MEMBER,
]

/**
 * Dónde está el trámite, de un vistazo.
 *
 * Los dos primeros escalones son, para todo efecto práctico, lo mismo: no
 * socio. Se muestran separados a propósito, porque lo que cambia entre ellos
 * —y lo único que la persona necesita saber— es si le toca hacer algo o
 * esperar.
 */
const Stepper = ({ current }: { current: MembershipStatus }) => {
    const currentIndex = STEPS.indexOf(current)

    return (
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {STEPS.map((step, index) => {
                const isDone = index < currentIndex
                const isCurrent = index === currentIndex

                return (
                    <li key={step} className="flex items-center gap-2">
                        <span
                            className={cn(
                                'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold',
                                isCurrent && 'bg-secondary text-secondary-foreground',
                                isDone && 'bg-success/10 text-success',
                                !isCurrent && !isDone && 'bg-muted text-muted-foreground',
                            )}
                        >
                            {isDone && <Check className="size-3.5" />}
                            {MEMBERSHIP_STATUS_LABELS[step]}
                        </span>
                        {index < STEPS.length - 1 && (
                            <span aria-hidden className="text-muted-foreground">
                                ›
                            </span>
                        )}
                    </li>
                )
            })}
        </ol>
    )
}

/**
 * El trámite de afiliación del socio (§1).
 *
 * > Registrarse no te hace socio. Socio se es cuando el club lo aprueba.
 *
 * Todo lo que se muestra acá sale de `GET /members/profile`: el estado, qué
 * falta cargar y si el botón de presentar va habilitado. Nada se recalcula en el
 * navegador — el gate del POST usa la misma función que arma `missingRequirements`,
 * así que lo que se ve y lo que el servidor acepta no pueden diferir.
 */
export const AffiliationPage = () => {
    const { data: profile, isLoading, isError } = useProfile()
    const { data: documents = [] } = useMyDocuments()
    const { mutate: submitApplication, isPending: isSubmitting } = useSubmitMembershipApplication()
    const { mutateAsync: cancelApplication } = useCancelMembershipApplication()

    if (isLoading) return <Skeleton className="h-96 rounded-xl" />

    if (isError || !profile) {
        return (
            <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                No pudimos cargar tu trámite. Probá recargar en unos minutos.
            </p>
        )
    }

    const isPending = profile.membershipStatus === MembershipStatuses.PENDING
    const isMember = profile.membershipStatus === MembershipStatuses.MEMBER

    const signedForm = documents.find(
        (document) => document.type === DocumentTypes.AFFILIATION_FORM,
    )

    return (
        <div className="flex flex-col gap-6">
            <div>
                <p className="kicker text-brand">Mi afiliación</p>
                <h1 className="text-display mt-2 text-3xl text-ink">
                    {isMember ? 'Sos socio del club' : 'Asociarte al club'}
                </h1>
                <div className="mt-4">
                    <Stepper current={profile.membershipStatus} />
                </div>
            </div>

            {/*
             * El motivo del rechazo va arriba de todo y antes que cualquier otra
             * cosa: es lo único que le dice a la persona qué arreglar. El backend
             * lo conserva hasta la nueva presentación justamente para que siga
             * visible mientras corrige.
             */}
            {profile.applicationRejectionReason && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
                    <p className="flex items-center gap-2 font-display font-bold text-destructive">
                        <AlertTriangle className="size-4.5 shrink-0" />
                        El club no aprobó tu solicitud
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                        {profile.applicationRejectionReason}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Corregí lo que dice arriba y volvé a presentarla desde acá. No perdés
                        nada de lo que ya cargaste.
                    </p>
                </div>
            )}

            {isMember ? (
                <section className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">
                        {profile.memberNumber
                            ? `Socio N° ${profile.memberNumber}`
                            : 'Afiliación aprobada'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {profile.memberSince
                            ? `Sos parte del club desde el ${formatCalendarDate(profile.memberSince)}.`
                            : 'El club ya aprobó tu afiliación.'}
                    </p>

                    {/* Después de aprobado, `missingRequirements` sigue llegando:
                        si el socio borró un dato obligatorio el club quiere
                        verlo, aunque ya no bloquee nada. */}
                    {profile.missingRequirements.length > 0 && (
                        <div className="mt-5">
                            <p className="kicker text-muted-foreground">
                                Datos que quedaron sin cargar
                            </p>
                            <div className="mt-2">
                                <AffiliationChecklist
                                    missing={profile.missingRequirements}
                                    isComplete={false}
                                />
                            </div>
                        </div>
                    )}

                </section>
            ) : (
                <section className="rounded-xl border bg-card p-6 shadow-soft">
                    {isPending ? (
                        <>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                                <Clock className="size-4.5 shrink-0 text-secondary" />
                                Tu solicitud está en revisión
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {profile.applicationSubmittedAt
                                    ? `La presentaste el ${formatCalendarDate(profile.applicationSubmittedAt)}. `
                                    : ''}
                                Alguien del club la mira y te avisa. Mientras tanto{' '}
                                <strong className="font-semibold text-ink">
                                    tu ficha queda congelada
                                </strong>
                                : no se pueden cambiar los datos, ni la foto, ni los
                                documentos.
                            </p>
                            {/*
                             * Cancelar no es un extra ni una salida: es el ÚNICO
                             * camino para corregir un dato mientras la solicitud
                             * está en revisión. Por eso se explica el circuito
                             * completo —cancelar, editar, volver a presentar— en
                             * vez de ofrecer un botón suelto que suena a
                             * arrepentirse.
                             */}
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                ¿Te falta corregir algo? Cancelá la solicitud, editá lo que
                                haga falta y volvé a presentarla. No perdés nada de lo que ya
                                cargaste.
                            </p>

                            <div className="mt-5">
                                <ConfirmDialog
                                    trigger={<Button variant="outline">Cancelar solicitud</Button>}
                                    title="Cancelar la solicitud"
                                    description="Vuelve a quedar como estaba antes de presentarla y podés editar tus datos otra vez. Cuando termines, la presentás de nuevo."
                                    confirmLabel="Cancelar solicitud"
                                    onConfirm={async () => {
                                        await cancelApplication()
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="font-display text-lg font-bold text-ink">
                                Lo que falta para presentar
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                Tener cuenta no es ser socio: hay que presentar la solicitud y
                                que el club la apruebe. Recién ahí te asignan tu número.
                            </p>

                            <div className="mt-4">
                                <AffiliationChecklist
                                    missing={profile.missingRequirements}
                                    isComplete={profile.missingRequirements.length === 0}
                                />
                            </div>

                            <Button
                                variant="hero"
                                className="mt-5"
                                disabled={!profile.canSubmitApplication || isSubmitting}
                                onClick={() => submitApplication()}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Send />
                                )}
                                {isSubmitting ? 'Presentando…' : 'Presentar solicitud'}
                            </Button>

                            {!profile.canSubmitApplication && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Vas a poder presentarla cuando no quede nada en la lista.
                                </p>
                            )}
                        </>
                    )}
                </section>
            )}

            {/* La tarjeta decide sola si hay algo que firmar: con el trámite
                cerrado se queda en "Firmada el X" y el botón de verla. */}
            <AffiliationFormCard
                profileId={profile.id}
                membershipStatus={profile.membershipStatus}
                signedAt={signedForm?.updatedAt ?? null}
                frozen={isPending}
            />

            {!isMember && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-soft">
                    <div>
                        <p className="font-display font-bold text-ink">Tus datos y documentos</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            El DNI, la foto y el resto de la ficha se cargan desde tu perfil.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/mi-cuenta/perfil">
                            Ir a mi perfil <ArrowRight />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
