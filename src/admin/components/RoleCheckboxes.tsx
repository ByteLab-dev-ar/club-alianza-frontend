import { ASSIGNABLE_ROLES, ROLE_LABELS, type AssignableRole } from '@/constants/roles'
import { cn } from '@/lib/utils'

interface Props {
    value: AssignableRole[]
    onChange: (roles: AssignableRole[]) => void
    /**
     * Roles que no se pueden tocar en este contexto. Se usa para el propio
     * usuario: el backend rechaza con 409 que un admin se quite a sí mismo el
     * rol de administrador, así que se bloquea el botón en vez de dejar que el
     * guardado falle.
     */
    lockedRoles?: readonly AssignableRole[]
    /** Motivo del bloqueo, como tooltip de los roles bloqueados. */
    lockedReason?: string
}

/** Selector de roles del personal. Un usuario puede tener varios. */
export const RoleCheckboxes = ({ value, onChange, lockedRoles = [], lockedReason }: Props) => {
    const toggle = (role: AssignableRole) => {
        onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role])
    }

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {ASSIGNABLE_ROLES.map((role) => {
                const checked = value.includes(role)
                const isLocked = lockedRoles.includes(role)
                return (
                    <button
                        key={role}
                        type="button"
                        onClick={() => toggle(role)}
                        disabled={isLocked}
                        title={isLocked ? lockedReason : undefined}
                        aria-pressed={checked}
                        className={cn(
                            'rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors',
                            checked
                                ? 'border-secondary bg-accent text-brand'
                                : 'border-border text-muted-foreground hover:border-ink/30',
                            isLocked && 'cursor-not-allowed opacity-60 hover:border-border',
                        )}
                    >
                        {ROLE_LABELS[role]}
                    </button>
                )
            })}
        </div>
    )
}
