import { MailCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { useResendWelcome } from '../hooks/useMembers'
import type { AdminMember } from '../interfaces/AdminMember'

interface Props {
    member: AdminMember
}

/**
 * Reenvía el correo de bienvenida con un link nuevo para configurar contraseña.
 *
 * Existe sobre todo para el socio que quedó sin activar después de un alta
 * masiva —el mail rebotó, se perdió, o dejó vencer el link—, pero sirve igual
 * para devolverle el acceso a alguien que ya lo tenía: por eso en las cuentas
 * activas cambia de texto en vez de desaparecer.
 *
 * El ConfirmDialog espera al `mutateAsync`, y este endpoint no responde hasta
 * que el servicio de mail confirma el envío. De ahí salen gratis el estado de
 * carga y el bloqueo del doble click, que acá importan más que en otros botones
 * porque la espera se nota (un par de segundos).
 */
export const ResendWelcomeButton = ({ member }: Props) => {
    const { mutateAsync } = useResendWelcome()

    // Al socio archivado no hay a quién reenviarle: su cuenta está revocada.
    if (member.deletedAt) return null

    const neverActivated = !member.isEmailVerified

    return (
        <ConfirmDialog
            trigger={
                <Button variant="outline">
                    <MailCheck /> {neverActivated ? 'Reenviar bienvenida' : 'Reenviar acceso'}
                </Button>
            }
            title={neverActivated ? 'Reenviar bienvenida' : 'Reenviar acceso'}
            description={
                <>
                    Se le manda a <strong className="text-ink">{member.email}</strong> un link nuevo
                    para definir su contraseña, válido por 72 horas. El link anterior deja de
                    funcionar.
                    {neverActivated && ' Este socio todavía no activó su cuenta.'}
                </>
            }
            confirmLabel="Reenviar"
            onConfirm={async () => {
                await mutateAsync(member.id)
            }}
        />
    )
}
