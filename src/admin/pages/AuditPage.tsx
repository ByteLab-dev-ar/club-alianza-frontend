import { useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/custom/Pagination'
import { formatCalendarDate } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { useAuditLogs } from '../hooks/useAuditLogs'
import { AUDIT_ENTITIES, auditActionLabel } from '../interfaces/AuditLog'

const ALL = 'all'

const formatDateTime = (iso: string) =>
    `${formatCalendarDate(iso)} ${new Date(iso).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    })}`

export const AuditPage = () => {
    const [entityName, setEntityName] = useState<string>(ALL)
    const [page, setPage] = useState(1)

    const { data, isLoading, isError, isPlaceholderData } = useAuditLogs({
        page,
        limit: 20,
        entityName: entityName === ALL ? undefined : entityName,
    })

    const logs = data?.items ?? []

    return (
        <>
            <AdminPageHeader
                kicker="Sistema"
                title="Auditoría"
                description="Registro inmutable de las operaciones del personal. Solo lectura."
                actions={
                    <Select
                        value={entityName}
                        onValueChange={(value) => {
                            setEntityName(value)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filtrar por recurso" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Todos los recursos</SelectItem>
                            {AUDIT_ENTITIES.map((entity) => (
                                <SelectItem key={entity.value} value={entity.value}>
                                    {entity.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />

            <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar la auditoría. Probá recargar en unos minutos.
                    </p>
                ) : logs.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No hay registros para este filtro.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Administrador</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Detalle</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap text-muted-foreground">
                                        {formatDateTime(log.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-semibold text-ink">
                                            {log.adminName
                                                ? `${log.adminName} ${log.adminSurname ?? ''}`.trim()
                                                : 'Sistema'}
                                        </p>
                                        {log.adminEmail && (
                                            <p className="text-xs text-muted-foreground">
                                                {log.adminEmail}
                                            </p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="soft">
                                            {auditActionLabel(log.action)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-muted-foreground">
                                        {log.description ?? '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {data && (
                <div className="mt-5">
                    <Pagination meta={data.meta} onPageChange={setPage} disabled={isPlaceholderData} />
                </div>
            )}
        </>
    )
}
