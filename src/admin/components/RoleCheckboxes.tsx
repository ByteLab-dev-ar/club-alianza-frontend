import { ASSIGNABLE_ROLES, ROLE_LABELS, type AssignableRole } from '@/constants/roles'
import { cn } from '@/lib/utils'

interface Props {
    value: AssignableRole[]
    onChange: (roles: AssignableRole[]) => void
}

/** Selector de roles del personal. Un usuario puede tener varios. */
export const RoleCheckboxes = ({ value, onChange }: Props) => {
    const toggle = (role: AssignableRole) => {
        onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role])
    }

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {ASSIGNABLE_ROLES.map((role) => {
                const checked = value.includes(role)
                return (
                    <button
                        key={role}
                        type="button"
                        onClick={() => toggle(role)}
                        aria-pressed={checked}
                        className={cn(
                            'rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors',
                            checked
                                ? 'border-secondary bg-accent text-brand'
                                : 'border-border text-muted-foreground hover:border-ink/30',
                        )}
                    >
                        {ROLE_LABELS[role]}
                    </button>
                )
            })}
        </div>
    )
}
