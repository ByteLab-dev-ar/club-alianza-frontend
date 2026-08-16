import { useState } from 'react'
import { Check, Eye, Loader2, User, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { formatCalendarDate } from '@/lib/format'
import { formatCuil } from '@/shared/schemas/fields'
import { MEMBER_SEX_LABELS } from '@/members/interfaces/MemberProfile'
import { MemberDocuments } from './MemberDocuments'
import { useApproveApplication, useRejectApplication } from '../hooks/useApplications'
import type { AdminMember } from '../interfaces/AdminMember'

/** Lo que exige el backend. Sin esto el "no" y el "mal" pasan el validador. */
const MIN_REASON_LENGTH = 10

const Field = ({ label, value }: { label: string; value: string | null }) => (
    <div>
        <p className="kicker text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium break-all text-ink">{value || '—'}</p>
    </div>
)

interface Props {
    application: AdminMember
}

/**
 * Revisar una solicitud de afiliación: mirar la ficha y los documentos, y
 * aprobar o rechazar.
 *
 * Los documentos se muestran acá porque son el trabajo: el sistema puede
 * verificar que los archivos ESTÉN —eso ya lo hizo, si no la solicitud no se
 * habría podido presentar— pero no que la foto del DNI sea de esa persona. Eso
 * lo mira alguien, y si no tuviera dónde mirarlo, aprobar sería apretar un
 * botón a ciegas.
 */
export const ApplicationReviewDialog = ({ application }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')

    const { mutate: approve, isPending: isApproving } = useApproveApplication()
    const { mutate: reject, isPending: isRejecting } = useRejectApplication()

    const isPending = isApproving || isRejecting
    const fullName = [application.name, application.surname].filter(Boolean).join(' ')
    const canReject = reason.trim().length >= MIN_REASON_LENGTH

    const close = () => {
        setIsOpen(false)
        setReason('')
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                // Al abrir arranca limpio: sin esto, un motivo tipeado para otra
                // solicitud y abandonado reaparecía en la siguiente.
                if (open) setReason('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Eye /> Revisar
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogTitle className="font-display text-lg font-bold">
                    {fullName || 'Solicitud de afiliación'}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    {application.applicationSubmittedAt
                        ? `Presentada el ${formatCalendarDate(application.applicationSubmittedAt)}.`
                        : 'Solicitud presentada.'}{' '}
                    Al aprobarla se le asigna el número de socio, que hasta ahora no tiene.
                </DialogDescription>

                <div className="mt-5 flex items-center gap-4">
                    {application.urlPhoto ? (
                        <img
                            src={application.urlPhoto}
                            alt=""
                            className="size-20 shrink-0 rounded-full border-2 border-accent object-cover"
                        />
                    ) : (
                        <span className="grid size-20 shrink-0 place-items-center rounded-full bg-accent text-brand">
                            <User className="size-9" />
                        </span>
                    )}
                    <p className="text-sm text-muted-foreground">
                        La foto va en la credencial que se escanea en la puerta: si no sirve
                        para identificar a la persona, la credencial tampoco.
                    </p>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <Field label="CUIL" value={formatCuil(application.cuil) || null} />
                    <Field label="DNI" value={application.dni} />
                    <Field label="Email" value={application.email} />
                    <Field label="Teléfono" value={application.phone} />
                    <Field
                        label="Fecha de nacimiento"
                        value={
                            application.bornDate
                                ? formatCalendarDate(application.bornDate)
                                : null
                        }
                    />
                    <Field
                        label="Sexo"
                        value={application.sex ? MEMBER_SEX_LABELS[application.sex] : null}
                    />
                    <div className="sm:col-span-2">
                        <Field label="Domicilio" value={application.address} />
                    </div>
                </div>

                <div className="mt-6 border-t pt-5">
                    <h3 className="font-display font-bold text-ink">Documentación</h3>
                    <p className="mt-1 mb-4 text-sm text-muted-foreground">
                        El DNI de los dos lados y la ficha de afiliación firmada.
                    </p>
                    {/* `enabled` va atado a la apertura del diálogo: sin eso el
                        listado se pediría una vez por fila de la bandeja. */}
                    <MemberDocuments memberId={application.id} enabled={isOpen} />
                </div>

                <div className="mt-6 grid gap-2 border-t pt-5">
                    <Label htmlFor={`reason-${application.id}`}>
                        Motivo del rechazo (obligatorio para rechazar)
                    </Label>
                    <Textarea
                        id={`reason-${application.id}`}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ej. la foto del DNI está borrosa, no se lee el número."
                        maxLength={500}
                        rows={3}
                    />
                    {/* Sin motivo la persona vuelve al principio sin saber qué
                        arreglar, y vuelve a presentar exactamente lo mismo. */}
                    <p className="text-xs text-muted-foreground">
                        Es lo único que va a ver para saber qué corregir. Mínimo{' '}
                        {MIN_REASON_LENGTH} caracteres.
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={isPending || !canReject}
                        onClick={() =>
                            reject(
                                { profileId: application.id, reason: reason.trim() },
                                { onSuccess: close },
                            )
                        }
                    >
                        {isRejecting ? <Loader2 className="animate-spin" /> : <X />}
                        Rechazar
                    </Button>
                    <Button
                        variant="hero"
                        disabled={isPending}
                        onClick={() => approve(application.id, { onSuccess: close })}
                    >
                        {isApproving ? <Loader2 className="animate-spin" /> : <Check />}
                        Aprobar y dar número
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
