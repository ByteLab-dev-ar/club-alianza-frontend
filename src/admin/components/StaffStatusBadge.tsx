import { Badge } from '@/components/ui/badge'
import { deriveStaffStatus, type StaffStatus } from '../lib/staff-status'
import type { StaffUser } from '../interfaces/StaffUser'

interface Props {
    user: StaffUser
}

type BadgeVariant = React.ComponentProps<typeof Badge>['variant']

const PRESENTATION: Record<
    StaffStatus,
    { label: string; variant: BadgeVariant; className?: string; title?: string }
> = {
    // Los dos estados "apagados" comparten el gris a propósito: la diferencia
    // entre ellos importa por el texto, no por el color.
    revoked: {
        label: 'Dado de baja',
        variant: 'outline',
        className: 'text-muted-foreground',
        title: 'Un admin le quitó el acceso. Sus pagos se conservan.',
    },
    inactive: {
        label: 'Inactivo',
        variant: 'outline',
        className: 'text-muted-foreground',
    },
    pending: {
        label: 'Pendiente',
        variant: 'warning',
        // El link de invitación vence a las 72 horas; si expiró hay que volver
        // a invitar a la persona.
        title: 'Invitación enviada, todavía sin aceptar. El link vence a las 72 horas.',
    },
    active: {
        label: 'Activo',
        variant: 'success',
    },
}

/**
 * Estado de una cuenta del personal.
 *
 * El tooltip va como `title` nativo y no como componente: no hay un Tooltip de
 * Radix instalado en el proyecto, y para un texto auxiliar como este no vale la
 * pena sumar la dependencia (mismo criterio que los botones deshabilitados de
 * esta pantalla).
 */
export const StaffStatusBadge = ({ user }: Props) => {
    const { label, variant, className, title } = PRESENTATION[deriveStaffStatus(user)]

    return (
        <Badge variant={variant} className={className} title={title}>
            {label}
        </Badge>
    )
}
