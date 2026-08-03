import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { useResendStaffInvite } from '../hooks/useStaff'
import { deriveStaffStatus } from '../lib/staff-status'
import type { StaffUser } from '../interfaces/StaffUser'

interface Props {
    user: StaffUser
}

/**
 * Reenvía el link de "configurá tu contraseña".
 *
 * Existe sobre todo para el que quedó en "Pendiente" —nunca abrió el mail, o lo
 * abrió después de las 72 horas que dura el link—, pero también sirve para
 * devolverle el acceso a alguien que ya lo tenía y lo perdió: por eso en las
 * cuentas activas cambia de nombre en vez de desaparecer.
 *
 * El ConfirmDialog espera al `mutateAsync`, y este endpoint no responde hasta
 * que el servicio de mail confirma el envío: eso da el estado de carga y el
 * bloqueo del doble click sin nada extra.
 */
export const ResendInviteButton = ({ user }: Props) => {
    const { mutateAsync } = useResendStaffInvite()
    const status = deriveStaffStatus(user)

    // En una cuenta dada de baja el backend responde 409: no se ofrece.
    if (status === 'revoked') return null

    const isPending = status === 'pending'

    return (
        <ConfirmDialog
            trigger={
                <Button variant="ghost" size="sm">
                    <Send /> {isPending ? 'Reenviar' : 'Reenviar acceso'}
                </Button>
            }
            title={isPending ? 'Reenviar invitación' : 'Reenviar acceso'}
            description={
                <>
                    Se le manda a <strong className="text-ink">{user.email}</strong> un link nuevo
                    para definir su contraseña, válido por 72 horas. El link anterior deja de
                    funcionar.
                </>
            }
            confirmLabel="Reenviar"
            onConfirm={async () => {
                await mutateAsync(user.id)
            }}
        />
    )
}
