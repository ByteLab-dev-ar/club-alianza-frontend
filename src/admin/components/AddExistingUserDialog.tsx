import { useState } from 'react'
import { Loader2, Search, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { isAssignableRole, type AssignableRole, type Role } from '@/constants/roles'
import { cn } from '@/lib/utils'
import { useStaff, useUpdateUserRoles } from '../hooks/useStaff'
import { RoleCheckboxes } from './RoleCheckboxes'
import type { StaffUser } from '../interfaces/StaffUser'

interface Props {
    /**
     * Email a precargar en el buscador (viene del 409 "email ya en uso").
     *
     * Se usa como estado inicial, no se sincroniza: quien lo cambia remonta el
     * componente con `key` (ver StaffPage). Sincronizarlo con un efecto además
     * pisaría lo que la persona estuviera tipeando.
     */
    prefillEmail?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

/**
 * Suma al personal a alguien que YA tiene cuenta.
 *
 * Hace falta desde que las listas están separadas: a un socio existente al que
 * se nombra tesorero no se lo puede invitar (su email ya está en uso) y tampoco
 * aparece en esta pantalla, porque todavía no es personal. El camino es
 * buscarlo entre todas las cuentas y asignarle roles.
 *
 * Es el único lugar que usa `includeMembers`: trae el padrón entero, así que
 * solo se consulta cuando hay algo escrito para filtrar.
 */
export const AddExistingUserDialog = ({ prefillEmail, open, onOpenChange }: Props) => {
    const [search, setSearch] = useState(prefillEmail ?? '')
    const [selected, setSelected] = useState<StaffUser | null>(null)
    const [roles, setRoles] = useState<AssignableRole[]>([])

    const debouncedSearch = useDebouncedValue(search, 350)
    const { mutate, isPending } = useUpdateUserRoles()

    const { data, isFetching } = useStaff(
        { includeMembers: true, search: debouncedSearch || undefined, limit: 8 },
        // Sin texto no se consulta: `includeMembers` devuelve TODAS las cuentas
        // y pedir las ~250 del padrón para no mostrarlas es puro desperdicio.
        { enabled: debouncedSearch.length > 0 },
    )

    const results = data?.items ?? []

    const reset = () => {
        setSearch('')
        setSelected(null)
        setRoles([])
    }

    const handleSelect = (user: StaffUser) => {
        setSelected(user)
        // Arranca con los roles de staff que ya tenga, para no pisárselos sin querer.
        setRoles(user.roles.filter(isAssignableRole))
    }

    const handleSave = () => {
        if (!selected) return
        // Conserva el rol 'user' si lo tenía: sacárselo le cortaría el portal del socio.
        const finalRoles: Role[] = selected.roles.includes('user')
            ? [...new Set<Role>(['user', ...roles])]
            : roles

        mutate(
            { id: selected.id, roles: finalRoles },
            {
                onSuccess: () => {
                    onOpenChange?.(false)
                    reset()
                },
            },
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                onOpenChange?.(next)
                if (!next) reset()
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus /> Sumar a un socio existente
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">
                        Sumar a un socio existente
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Buscá una cuenta que ya exista y asignale los roles del panel. Para alguien
                        que todavía no tiene cuenta, usá "Nuevo administrador".
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-4">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setSelected(null)
                        }}
                        placeholder="Buscar por email…"
                        className="pl-10"
                    />
                    {isFetching && (
                        <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                </div>

                {!selected && (
                    <div className="mt-3 max-h-56 overflow-y-auto">
                        {!debouncedSearch ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Escribí un email para buscar.
                            </p>
                        ) : results.length === 0 && !isFetching ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Ninguna cuenta coincide con "{debouncedSearch}".
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {results.map((user) => (
                                    <li key={user.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(user)}
                                            className="flex w-full items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-accent"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-ink">
                                                    {user.email}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {user.roles.join(', ')}
                                                </span>
                                            </span>
                                            {user.isMember && <Badge variant="soft">Socio</Badge>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {selected && (
                    <div className="mt-3">
                        <div
                            className={cn(
                                'flex items-center justify-between gap-3 rounded-lg border p-3',
                                'border-secondary bg-accent',
                            )}
                        >
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-ink">
                                    {selected.email}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {selected.isMember ? 'Socio del club' : 'No es socio'}
                                </span>
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                                Cambiar
                            </Button>
                        </div>

                        <p className="mt-4 mb-2 text-sm font-semibold text-ink">Roles a asignar</p>
                        <RoleCheckboxes value={roles} onChange={setRoles} />
                    </div>
                )}

                <DialogFooter className="mt-6 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="hero"
                        onClick={handleSave}
                        disabled={isPending || !selected || roles.length === 0}
                    >
                        {isPending && <Loader2 className="animate-spin" />}
                        Sumar al personal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
