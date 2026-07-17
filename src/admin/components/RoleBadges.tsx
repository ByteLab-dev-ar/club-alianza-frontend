import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS, type Role } from '@/constants/roles'

interface Props {
    roles: Role[]
}

const VARIANT_BY_ROLE: Record<Role, 'default' | 'soft' | 'warning' | 'success'> = {
    admin: 'default',
    accountant: 'success',
    web_admin: 'soft',
    user: 'warning',
}

export const RoleBadges = ({ roles }: Props) => {
    return (
        <div className="flex flex-wrap gap-1.5">
            {roles.map((role) => (
                <Badge key={role} variant={VARIANT_BY_ROLE[role]}>
                    {ROLE_LABELS[role]}
                </Badge>
            ))}
        </div>
    )
}
