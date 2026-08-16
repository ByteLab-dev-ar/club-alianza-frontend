import { useState } from 'react'
import { Link } from 'react-router'
import { Eye, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/custom/Pagination'
import { FilterPills } from '@/components/custom/FilterPills'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { formatCalendarDate } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { MemberStatusBadge } from '../components/MemberStatusBadge'
import { MemberFormDialog } from '../components/MemberFormDialog'
import { BulkImportDialog } from '../components/BulkImportDialog'
import { useMembers } from '../hooks/useMembers'

/**
 * Los filtros del padrón, como una sola dimensión.
 *
 * `expired` y `delinquent` son **dos listas distintas y las dos sirven**, y por
 * eso van separadas y no como un check: "vencidos" es la lista de cobranza
 * —todos los que deben, incluidos los importados sin fecha de cobertura— y
 * "morosos" es el subconjunto más chico de los que además quedaron bloqueados y
 * solo se destraban en la sede.
 *
 * `deactivated` tiene precedencia sobre el estado de la cuota del lado del
 * servidor —no significa nada sobre alguien que ya no es socio—, así que va en
 * el mismo grupo excluyente y no como un filtro aparte que se pueda combinar mal.
 */
type StatusFilter = 'all' | 'active' | 'expired' | 'delinquent' | 'deactivated'

const STATUS_FILTERS: readonly { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Al día' },
    { value: 'expired', label: 'Vencidos' },
    { value: 'delinquent', label: 'Morosos' },
    { value: 'deactivated', label: 'Dados de baja' },
]

/** Qué manda cada filtro. Un solo lugar, para que la tabla y la query no divirjan. */
const queryForStatus = (status: StatusFilter) => {
    switch (status) {
        case 'active':
            return { isActive: true }
        case 'expired':
            return { isActive: false }
        case 'delinquent':
            return { delinquent: true }
        case 'deactivated':
            return { deactivated: true }
        default:
            return {}
    }
}

export const MembersListPage = () => {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<StatusFilter>('all')
    const [onlyPlayers, setOnlyPlayers] = useState(false)
    const [page, setPage] = useState(1)

    // La búsqueda no dispara una request por tecla: espera a que el usuario frene.
    const debouncedSearch = useDebouncedValue(search, 350)

    const { data, isLoading, isError, isPlaceholderData } = useMembers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        ...queryForStatus(status),
        // Se cruza con los demás: "jugadores" + "vencidos" son los jugadores que
        // deben. Filtra por la MARCA y no por la cobertura.
        ...(onlyPlayers ? { isPlayer: true } : {}),
    })

    const members = data?.items ?? []

    const resetToFirstPage = () => setPage(1)

    return (
        <>
            <AdminPageHeader
                kicker="Gestión"
                title="Socios"
                actions={
                    <>
                        <BulkImportDialog />
                        <MemberFormDialog />
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
                        placeholder="Buscar por nombre, apellido o email…"
                        className="pl-10"
                    />
                </div>
                <FilterPills
                    options={STATUS_FILTERS}
                    value={status}
                    onChange={(next) => {
                        setStatus(next)
                        resetToFirstPage()
                    }}
                    size="sm"
                />
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-ink">
                    <input
                        type="checkbox"
                        checked={onlyPlayers}
                        onChange={(event) => {
                            setOnlyPlayers(event.target.checked)
                            resetToFirstPage()
                        }}
                        className="size-4 accent-[var(--brand)]"
                    />
                    Solo jugadores
                </label>
            </div>

            <div className="rounded-xl border bg-card shadow-soft">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar los socios. Probá recargar en unos minutos.
                    </p>
                ) : members.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        {debouncedSearch
                            ? 'No hay socios que coincidan con la búsqueda.'
                            : 'Todavía no hay socios cargados.'}
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>N° socio</TableHead>
                                <TableHead>Socio</TableHead>
                                <TableHead>DNI</TableHead>
                                <TableHead>Membresía</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-mono text-muted-foreground">
                                        {member.memberNumber ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-semibold text-ink">
                                            {member.name} {member.surname}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {member.dni ?? '—'}
                                    </TableCell>
                                    {/* La membresía y no las tres: es la que decide
                                        el badge de al lado (isActive) y la única que
                                        bloquea. Las otras dos coberturas viven en la
                                        ficha, que es donde hay lugar para explicar
                                        que vencidas no significan lo mismo. */}
                                    <TableCell className="text-muted-foreground">
                                        {member.membershipUntil
                                            ? formatCalendarDate(member.membershipUntil)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <MemberStatusBadge isActive={member.isActive} />
                                        {/* La marca, no la cobertura: la
                                            categoría sale de `playerCategoryLabel`
                                            y nunca de una tabla local. */}
                                        {member.isPlayer && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Jugador
                                                {member.playerCategoryLabel
                                                    ? ` — ${member.playerCategoryLabel}`
                                                    : ''}
                                            </p>
                                        )}
                                        {member.delinquentSince && (
                                            <p className="mt-1 text-xs text-destructive">Moroso</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link to={`/admin/socios/${member.id}`}>
                                                <Eye /> Ver
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {data && (
                <div className="mt-5">
                    <Pagination
                        meta={data.meta}
                        onPageChange={setPage}
                        disabled={isPlaceholderData}
                    />
                </div>
            )}
        </>
    )
}
