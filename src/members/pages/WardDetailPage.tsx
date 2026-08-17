import { Link, useParams, useSearchParams } from 'react-router'
import { differenceInYears } from 'date-fns'
import { AlertTriangle, ArrowLeft, Clock, Loader2, Lock, Send, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { formatCalendarDate, parseCalendarDate } from '@/lib/format'
import {
    DocumentTypes,
    MEMBERSHIP_STATUS_LABELS,
    MembershipStatuses,
} from '../interfaces/MemberProfile'
import {
    useCancelWardApplication,
    useSubmitWardApplication,
    useUnmarkWardAsPlayer,
    useWard,
    useWardCredential,
    useWardDocuments,
} from '../hooks/useWards'
import { AffiliationChecklist } from '../components/AffiliationChecklist'
import { ProfileForm } from '../components/ProfileForm'
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload'
import { DocumentUpload } from '../components/DocumentUpload'
import { AffiliationFormCard } from '../components/AffiliationFormCard'
import { AttachWardAccountDialog } from '../components/AttachWardAccountDialog'
import { CredentialCard } from '../components/CredentialCard'

/** Desde qué edad el tutor puede autorizarle la cuenta propia (§2.6). */
const ACCOUNT_MIN_AGE = 16

/**
 * La ficha de un tutelado.
 *
 * Es el trámite de §1 completo, con el vínculo como autorización: los mismos
 * datos, los mismos documentos, la misma ficha firmada y la misma solicitud. Lo
 * único que cambia es que lo hace otro.
 *
 * La ficha sale de `GET /members/wards/{profileId}` y no del listado, y esa es
 * la diferencia que hace que la pantalla sirva: el listado devuelve la ficha
 * **sin el trámite**, así que el tutor cargaba a ciegas y se enteraba de lo que
 * faltaba recién por el 422 al presentar. §2.1 dice que un menor es un socio
 * completo, y sobre el mismo trámite el adulto veía un checklist y el menor no.
 */
export const WardDetailPage = () => {
    const { profileId = '' } = useParams()
    const [searchParams] = useSearchParams()
    const focusField = searchParams.get('campo')

    const { data: ward, isLoading, error } = useWard(profileId)

    const isMember = ward?.membershipStatus === MembershipStatuses.MEMBER
    const { data: credential } = useWardCredential(profileId, !!isMember)
    const { data: documents = [] } = useWardDocuments(profileId)

    const { mutate: submitApplication, isPending: isSubmitting } =
        useSubmitWardApplication(profileId)
    const { mutateAsync: cancelApplication } = useCancelWardApplication(profileId)
    const { mutateAsync: unmarkAsPlayer } = useUnmarkWardAsPlayer(profileId)

    if (isLoading) return <Skeleton className="h-96 rounded-xl" />

    /*
     * Los dos errores posibles dicen cosas distintas y el backend ya las
     * escribe: el 404 es "no es un tutelado tuyo" y el 409 es "ya cumplió 18 y
     * se gestiona sola" (§2.6). Traducir el segundo a "no lo encontramos"
     * dejaría al tutor buscando un chico que en realidad se emancipó.
     */
    if (!ward) {
        return (
            <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                {getApiErrorMessage(
                    error,
                    'No encontramos a esa persona entre los chicos que tenés a cargo.',
                )}
            </p>
        )
    }

    const isPending = ward.membershipStatus === MembershipStatuses.PENDING
    const fullName = [ward.name, ward.surname].filter(Boolean).join(' ')

    /*
     * La edad se calcula acá SOLO para decidir si mostrar el botón: quien decide
     * de verdad es el servidor, que responde 409 por debajo de los 16 y también
     * a los 18 —ahí la persona ya es adulta y la cuenta se la engancha el club—.
     * No es lo mismo que calcular una categoría o un precio en el cliente.
     */
    const age = ward.bornDate
        ? differenceInYears(new Date(), parseCalendarDate(ward.bornDate))
        : null
    const canOfferAccount = !ward.hasAccount && age !== null && age >= ACCOUNT_MIN_AGE && age < 18

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Button asChild variant="ghost" size="sm" className="-ml-2">
                    <Link to="/mi-cuenta/chicos">
                        <ArrowLeft /> Mis chicos
                    </Link>
                </Button>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <h1 className="text-display text-3xl text-ink">{fullName}</h1>
                    <Badge variant={isMember ? 'success' : 'soft'}>
                        {isMember && ward.memberNumber
                            ? `Socio N° ${ward.memberNumber}`
                            : MEMBERSHIP_STATUS_LABELS[ward.membershipStatus]}
                    </Badge>
                    {ward.isPlayer && (
                        <Badge variant="outline">
                            {ward.playerCategoryLabel
                                ? `Jugador — ${ward.playerCategoryLabel}`
                                : 'Jugador'}
                        </Badge>
                    )}
                </div>
            </div>

            {ward.applicationRejectionReason && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6">
                    <p className="flex items-center gap-2 font-display font-bold text-destructive">
                        <AlertTriangle className="size-4.5 shrink-0" />
                        El club no aprobó su solicitud
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                        {ward.applicationRejectionReason}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Corregí lo que dice arriba y volvé a presentarla. No se pierde nada de
                        lo que ya cargaste.
                    </p>
                </div>
            )}

            {/* El trámite: presentar o cancelar. Es el mismo circuito del adulto. */}
            {!isMember && (
                <section className="rounded-xl border bg-card p-6 shadow-soft">
                    {isPending ? (
                        <>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                                <Clock className="size-4.5 shrink-0 text-secondary" />
                                Su solicitud está en revisión
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {ward.applicationSubmittedAt
                                    ? `La presentaste el ${formatCalendarDate(ward.applicationSubmittedAt)}. `
                                    : ''}
                                Mientras el club la mira,{' '}
                                <strong className="font-semibold text-ink">
                                    su ficha queda congelada
                                </strong>
                                . Para corregir algo hay que cancelarla, editar y volver a
                                presentarla.
                            </p>
                            <div className="mt-5">
                                <ConfirmDialog
                                    trigger={<Button variant="outline">Cancelar solicitud</Button>}
                                    title="Cancelar la solicitud"
                                    description={`${ward.name} vuelve a quedar como antes de presentarla y vas a poder editar sus datos otra vez.`}
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
                                Lo que falta para presentar su solicitud
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                Cuando tenga los datos, la foto, el DNI de los dos lados y la
                                ficha firmada, presentala. El club la revisa y ahí le asigna su
                                número de socio.
                            </p>

                            {/*
                             * El mismo checklist que ve el adulto sobre su propio
                             * trámite (§2.1: un menor es un socio completo). La
                             * lista la calcula el servidor con la misma función
                             * que aplica el gate del POST, así que lo que se ve y
                             * lo que se acepta no pueden diferir. `basePath` en
                             * null porque acá no hay adónde mandar a nadie: los
                             * datos, la foto, los documentos y la ficha se cargan
                             * todos más abajo en esta misma página.
                             */}
                            <div className="mt-4">
                                <AffiliationChecklist
                                    missing={ward.missingRequirements}
                                    isComplete={ward.missingRequirements.length === 0}
                                    basePath={null}
                                />
                            </div>

                            <Button
                                variant="hero"
                                className="mt-5"
                                disabled={!ward.canSubmitApplication || isSubmitting}
                                onClick={() => submitApplication()}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                {isSubmitting ? 'Presentando…' : 'Presentar solicitud'}
                            </Button>

                            {!ward.canSubmitApplication && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Vas a poder presentarla cuando no quede nada en la lista.
                                </p>
                            )}
                        </>
                    )}
                </section>
            )}

            {/* Después de aprobado el checklist sigue llegando y ya no bloquea
                nada, pero si el chico quedó sin un dato obligatorio el club
                quiere verlo — y quien lo puede cargar es el tutor. */}
            {isMember && ward.missingRequirements.length > 0 && (
                <section className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">
                        Datos que quedaron sin cargar
                    </h2>
                    <div className="mt-4">
                        <AffiliationChecklist
                            missing={ward.missingRequirements}
                            isComplete={false}
                            basePath={null}
                        />
                    </div>
                </section>
            )}

            {isPending && (
                <p className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm leading-relaxed text-muted-foreground">
                    <Lock className="mt-0.5 size-4.5 shrink-0 text-warning" />
                    Sus datos, su foto y sus documentos están congelados mientras el club revisa
                    la solicitud.
                </p>
            )}

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <ProfilePhotoUpload urlPhoto={ward.urlPhoto} frozen={isPending} wardId={ward.id} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Sus datos</h2>
                {/* No lleva correo a propósito: al menor no se le pide (§2.2).
                    Los avisos que le corresponden le llegan a sus tutores. */}
                <div className="mt-6">
                    <ProfileForm
                        profile={ward}
                        wardId={ward.id}
                        frozen={isPending}
                        focusField={focusField}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Su documentación</h2>
                <div className="mt-6">
                    <DocumentUpload frozen={isPending} wardId={ward.id} />
                </div>
            </div>

            <AffiliationFormCard
                profileId={ward.id}
                membershipStatus={ward.membershipStatus}
                signedAt={
                    documents.find(
                        (document) => document.type === DocumentTypes.AFFILIATION_FORM,
                    )?.updatedAt ?? null
                }
                frozen={isPending}
            />

            {/* La credencial: para mostrarla en la puerta desde el teléfono, o
                mandarle una captura. El QR no vence, así que esa imagen le sirve
                indefinidamente — es lo que hace que no necesite cuenta propia. */}
            {isMember && credential && (
                <section className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">Su credencial</h2>
                    <p className="mt-1 mb-6 text-sm leading-relaxed text-muted-foreground">
                        Mostrásela en la puerta desde tu teléfono, o mandale una captura: el
                        código no vence, así que esa imagen le sirve siempre.
                    </p>
                    <CredentialCard credential={credential} />
                </section>
            )}

            <section className="rounded-xl border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink">Otras acciones</h2>

                <div className="mt-4 flex flex-col divide-y">
                    {/* Solo DESMARCAR. Volver a marcarlo es dar de alta a alguien
                        en un cobro y lo decide el club: el endpoint responde 403
                        si se intenta desde acá, así que ni se ofrece. */}
                    {ward.isPlayer && (
                        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                            <div>
                                <p className="font-semibold text-ink">Sacarlo de la actividad</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Deja de jugar y no se le cobra más la actividad.
                                </p>
                            </div>
                            <ConfirmDialog
                                trigger={<Button variant="outline">Ya no juega</Button>}
                                title={`Sacar a ${ward.name} de la actividad`}
                                description={
                                    ward.isActivityUpToDate
                                        ? 'No pierde lo que ya está pago: la actividad le sigue corriendo hasta que venza, y hasta entonces la credencial lo muestra habilitado para entrenar. Lo que cambia es que a partir de ahí no se le cobra más. Volver a anotarlo lo hace el club.'
                                        : 'A partir de ahora no se le va a cobrar más la actividad. Volver a anotarlo lo hace el club.'
                                }
                                confirmLabel="Sacarlo de la actividad"
                                onConfirm={async () => {
                                    await unmarkAsPlayer()
                                }}
                            />
                        </div>
                    )}

                    {canOfferAccount && (
                        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                            <div>
                                <p className="font-semibold text-ink">Darle su propia cuenta</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ya tiene {age} años: puede entrar solo a ver su credencial y
                                    su situación.
                                </p>
                            </div>
                            <AttachWardAccountDialog
                                profileId={ward.id}
                                wardName={ward.name ?? 'el chico'}
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                        <div>
                            <p className="font-semibold text-ink">Sumar otro tutor</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Se le reclama la cuota a los dos por igual. Se hace desde "Mis
                                chicos".
                            </p>
                        </div>
                        <Button asChild variant="ghost">
                            <Link to="/mi-cuenta/chicos">
                                <UserPlus /> Ir a invitar
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
