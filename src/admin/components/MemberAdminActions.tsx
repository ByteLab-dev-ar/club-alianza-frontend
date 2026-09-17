import { useState } from 'react'
import { KeyRound, Loader2, ShieldCheck, Trophy, UserMinus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { notify } from '@/lib/notify'
import {
    useAttachAccount,
    useClearDelinquency,
    useGuardians,
    useRemoveGuardian,
    useSetPlayerMark,
} from '../hooks/useMembers'
import type { AdminMember } from '../interfaces/AdminMember'

/** Lo que exige el backend para el motivo del destrabe. */
const MIN_REASON_LENGTH = 10

const Row = ({
    title,
    description,
    action,
}: {
    title: string
    description: string
    action: React.ReactNode
}) => (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0">
            <p className="font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="shrink-0">{action}</div>
    </div>
)

const AttachAccountDialog = ({ member }: { member: AdminMember }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const { mutate, isPending } = useAttachAccount(member.id)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) setEmail('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <KeyRound /> Darle una cuenta
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogTitle className="font-display text-lg font-bold">
                    Darle una cuenta a {member.name}
                </DialogTitle>
                {/* Es la diferencia que importa: dar de alta a la persona otra
                    vez le rompería el número de socio y la antigüedad. */}
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    No se crea un socio nuevo: se le ata un acceso al perfil que ya existe.
                    Conserva su número, su antigüedad y todos sus pagos.
                </DialogDescription>

                <div className="mt-5 grid gap-2">
                    <Label htmlFor="attach-email">Correo</Label>
                    <Input
                        id="attach-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="socio@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                        El correo es único en el sistema: tiene que ser propio y estar libre.
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        disabled={isPending || email.trim().length === 0}
                        onClick={() =>
                            mutate(email.trim(), {
                                onSuccess: () => setIsOpen(false),
                                onError: (error) =>
                                    notify.error(
                                        getApiErrorMessage(error, 'No pudimos crear la cuenta'),
                                    ),
                            })
                        }
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Crear cuenta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ClearDelinquencyDialog = ({ member }: { member: AdminMember }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')
    const { mutate, isPending } = useClearDelinquency(member.id)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) setReason('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ShieldCheck /> Destrabar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogTitle className="font-display text-lg font-bold">
                    Destrabar a {member.name}
                </DialogTitle>
                {/* Indulto, no amnistía: si sigue debiendo, la corrida nocturna
                    lo vuelve a marcar. Decirlo evita que alguien lo use creyendo
                    que le está perdonando la cuota. */}
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Vuelve a poder cargar comprobantes desde la app.{' '}
                    <strong className="font-semibold text-ink">
                        Esto no le extiende la cobertura
                    </strong>
                    : si efectivamente sigue debiendo, el proceso nocturno lo vuelve a marcar.
                    Para perdonarle la deuda hay que moverle el vencimiento desde "Editar".
                </DialogDescription>

                <div className="mt-5 grid gap-2">
                    <Label htmlFor="clear-reason">Motivo (queda en auditoría)</Label>
                    <Textarea
                        id="clear-reason"
                        rows={3}
                        maxLength={300}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Ej. pagó en la sede el 03/08 y no se registró en el sistema."
                    />
                    <p className="text-xs text-muted-foreground">
                        Mínimo {MIN_REASON_LENGTH} caracteres.
                    </p>
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        disabled={isPending || reason.trim().length < MIN_REASON_LENGTH}
                        onClick={() =>
                            mutate(reason.trim(), { onSuccess: () => setIsOpen(false) })
                        }
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Destrabar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Quiénes responden por este socio, y la quita.
 *
 * La restricción se muestra ANTES del click y no solo como error: con un solo
 * tutor el botón no aparece, porque **un chico nunca puede quedar sin ningún
 * tutor**. Ofrecerlo para que el backend conteste 409 sería hacerle perder el
 * tiempo a quien está atendiendo a alguien en el mostrador.
 */
const Guardians = ({ member }: { member: AdminMember }) => {
    const { data: guardians = [], isLoading } = useGuardians(member.id)
    const { mutateAsync: removeGuardian } = useRemoveGuardian(member.id)

    if (isLoading) {
        return <p className="py-4 text-sm text-muted-foreground">Cargando tutores…</p>
    }

    if (guardians.length === 0) {
        return (
            <p className="py-4 text-sm text-muted-foreground">
                Nadie figura como tutor de este socio.
            </p>
        )
    }

    const isOnlyGuardian = guardians.length === 1

    return (
        <ul className="flex flex-col divide-y">
            {guardians.map((guardian) => (
                <li
                    key={guardian.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">
                            {guardian.name} {guardian.surname}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {guardian.email ?? 'Sin cuenta'}
                        </p>
                    </div>

                    {isOnlyGuardian ? (
                        <p className="shrink-0 text-xs text-muted-foreground">
                            Es el único tutor: hay que asignarle otro antes de sacarlo.
                        </p>
                    ) : (
                        <ConfirmDialog
                            trigger={
                                <Button variant="ghost" size="sm">
                                    <UserMinus /> Sacar
                                </Button>
                            }
                            title="Sacar al tutor"
                            description={`${guardian.name} deja de responder por ${member.name}. No queda ninguna deuda colgada: el pasado no se acumula.`}
                            confirmLabel="Sacar tutor"
                            destructive
                            onConfirm={async () => {
                                await removeGuardian(guardian.id)
                            }}
                        />
                    )}
                </li>
            ))}
        </ul>
    )
}

/**
 * Las acciones de gestión de un socio que no caben en el encabezado: la marca de
 * jugador, la cuenta, los tutores y el destrabe de morosidad.
 */
export const MemberAdminActions = ({ member }: { member: AdminMember }) => {
    const { mutate: setPlayerMark, isPending: isSettingMark } = useSetPlayerMark()

    return (
        <div className="rounded-xl border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Gestión</h2>

            <div className="mt-2 flex flex-col divide-y">
                {/*
                 * La marca gobierna el futuro —si se le sigue cobrando la
                 * actividad—, no lo que puede hacer hoy: la cobertura corre hasta
                 * su vencimiento aunque se lo desmarque. El texto lo dice porque
                 * es la confusión que §5.7 existe para evitar.
                 */}
                <Row
                    title={member.isPlayer ? 'Está marcado como jugador' : 'No es jugador'}
                    description={
                        member.isPlayer
                            ? `Se le cobra la actividad${member.playerCategoryLabel ? `, y juega en ${member.playerCategoryLabel}` : ''}. Desmarcarlo no le quita lo que ya pagó.`
                            : 'Marcarlo hace que de acá en adelante se le cobre la actividad. No le acredita nada.'
                    }
                    action={
                        <Button
                            variant="outline"
                            disabled={isSettingMark}
                            onClick={() =>
                                setPlayerMark({ id: member.id, isPlayer: !member.isPlayer })
                            }
                        >
                            {isSettingMark ? <Loader2 className="animate-spin" /> : <Trophy />}
                            {member.isPlayer ? 'Sacarlo de la actividad' : 'Marcar como jugador'}
                        </Button>
                    }
                />

                {!member.hasAccount && (
                    <Row
                        title="No tiene cuenta"
                        description="Es socio igual —con su número, su credencial y su cuota—, pero no tiene con qué entrar al portal."
                        action={<AttachAccountDialog member={member} />}
                    />
                )}

                {member.delinquentSince && (
                    <Row
                        title="Está marcado como moroso"
                        description="Tiene bloqueada la carga de comprobantes desde la app. Se destraba pagando en la sede, aprobándole una transferencia, o a mano desde acá."
                        action={<ClearDelinquencyDialog member={member} />}
                    />
                )}

                <div className="py-4">
                    <p className="font-semibold text-ink">Tutores</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Quiénes responden por la cuota de este socio. No hay auto-baja: los
                        saca el club, a pedido.
                    </p>
                    <div className="mt-2">
                        <Guardians member={member} />
                    </div>
                </div>
            </div>
        </div>
    )
}
