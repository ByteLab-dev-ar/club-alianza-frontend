import { useState } from 'react'
import { Pencil, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/custom/Pagination'
import { FilterPills } from '@/components/custom/FilterPills'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { usePageInRange } from '@/lib/usePageInRange'
import { formatCalendarDate } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { RoleBadges } from '../components/RoleBadges'
import { StaffFormDialog } from '../components/StaffFormDialog'
import { AddExistingUserDialog } from '../components/AddExistingUserDialog'
import { EditRolesDialog } from '../components/EditRolesDialog'
import { RemoveFromStaffButton } from '../components/RemoveFromStaffButton'
import { ReinstateStaffDialog } from '../components/ReinstateStaffDialog'
import { ResendInviteButton } from '../components/ResendInviteButton'
import { StaffStatusBadge } from '../components/StaffStatusBadge'
import { useStaff } from '../hooks/useStaff'

/**
 * Las cuentas dadas de baja necesitan su propia solapa porque la baja también
 * les saca los roles: dejan de ser personal y no salen en el listado por
 * defecto. Sin esto no había forma de llegar a ellas para reincorporarlas.
 */
type Tab = 'staff' | 'deactivated'

const TABS: readonly { value: Tab; label: string }[] = [
    { value: 'staff', label: 'Personal' },
    { value: 'deactivated', label: 'Dadas de baja' },
]

export const StaffPage = () => {
    const [tab, setTab] = useState<Tab>('staff')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    // Estado del diálogo de "sumar socio existente": se abre solo cuando la
    // invitación falla por email ya registrado, que es justo cuando hace falta.
    const [addExistingOpen, setAddExistingOpen] = useState(false)
    const [takenEmail, setTakenEmail] = useState<string>()

    const debouncedSearch = useDebouncedValue(search, 350)

    const isDeactivatedTab = tab === 'deactivated'

    const { data, isLoading, isError, isPlaceholderData } = useStaff({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        // Sin `includeMembers`: para las bajas alcanza este filtro, y traer todas
        // las cuentas arrastraría el padrón entero de socios.
        deactivated: isDeactivatedTab || undefined,
    })

    // Quitar a alguien del personal lo saca de "Personal", y reincorporarlo lo
    // saca de "Dadas de baja": hacerlo con el último de la página 2 dejaba la
    // solapa diciendo que no había nadie ("Todavía no hay administradores
    // cargados." o "No hay cuentas dadas de baja.") y sin paginación para
    // volver. Lo mismo con un "Siguiente" antes de que viaje la búsqueda
    // (debounce).
    const { isSettling } = usePageInRange({ page, data, isPlaceholderData, onPageChange: setPage })

    const users = data?.items ?? []
    const meta = data?.meta

    const resetToFirstPage = () => setPage(1)

    return (
        <>
            <AdminPageHeader
                kicker="Sistema"
                title="Administradores"
                description="Personal del club: administradores, tesorería, admins web y recepción."
                actions={
                    <>
                        {/* La key remonta el diálogo cuando cambia el email a
                            precargar: así el buscador arranca con ese valor sin
                            necesitar un efecto que sincronice estado. */}
                        <AddExistingUserDialog
                            key={takenEmail ?? 'sin-precarga'}
                            open={addExistingOpen}
                            onOpenChange={setAddExistingOpen}
                            prefillEmail={takenEmail}
                        />
                        <StaffFormDialog
                            onEmailTaken={(email) => {
                                // Ese email ya tiene cuenta: lo que corresponde no es
                                // invitar de nuevo sino asignarle roles.
                                setTakenEmail(email)
                                setAddExistingOpen(true)
                            }}
                        />
                    </>
                }
            />

            <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="relative min-w-64 flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            resetToFirstPage()
                        }}
                        placeholder="Buscar por email…"
                        className="pl-10"
                    />
                </div>
                <FilterPills
                    options={TABS}
                    value={tab}
                    onChange={(next) => {
                        setTab(next)
                        resetToFirstPage()
                    }}
                />
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                {isLoading || isSettling ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar los administradores. Probá recargar en unos minutos.
                    </p>
                ) : users.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        {debouncedSearch
                            ? `Ninguna cuenta coincide con "${debouncedSearch}".`
                            : isDeactivatedTab
                              ? 'No hay cuentas dadas de baja.'
                              : 'Todavía no hay administradores cargados.'}
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Socio</TableHead>
                                <TableHead>Alta</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-semibold text-ink">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <RoleBadges roles={user.roles} />
                                    </TableCell>
                                    <TableCell>
                                        <StaffStatusBadge user={user} />
                                    </TableCell>
                                    <TableCell>
                                        {/* Anticipa qué va a pasar si se lo quita del
                                            personal: el socio conserva su cuenta. */}
                                        {user.isMember ? (
                                            <Badge variant="soft">Socio</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatCalendarDate(user.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {isDeactivatedTab ? (
                                                /* Reincorporar es lo único posible acá: el
                                                   backend rechaza cambiarle los roles o
                                                   reenviarle la invitación a una cuenta
                                                   dada de baja. */
                                                <ReinstateStaffDialog user={user} />
                                            ) : (
                                                <>
                                                    <EditRolesDialog
                                                        user={user}
                                                        trigger={
                                                            <Button variant="ghost" size="sm">
                                                                <Pencil /> Roles
                                                            </Button>
                                                        }
                                                    />
                                                    <ResendInviteButton user={user} />
                                                    <RemoveFromStaffButton user={user} />
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {meta && !isSettling && (
                <div className="mt-5">
                    <Pagination
                        meta={meta}
                        onPageChange={setPage}
                        disabled={isPlaceholderData}
                    />
                </div>
            )}
        </>
    )
}
