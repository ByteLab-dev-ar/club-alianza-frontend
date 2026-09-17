import { useState } from 'react'
import { Inbox } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/custom/Pagination'
import { formatCalendarDate } from '@/lib/format'
import { usePageInRange } from '@/lib/usePageInRange'
import { formatCuil } from '@/shared/schemas/fields'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ApplicationReviewDialog } from '../components/ApplicationReviewDialog'
import { useApplications } from '../hooks/useApplications'

/**
 * La bandeja de solicitudes de afiliación (§1.6).
 *
 * > Registrarse no te hace socio. Socio se es cuando el club lo aprueba.
 *
 * Es la otra mitad del trámite del portal: alguien tiene que revisar. Va en su
 * propia pantalla y no como un filtro del padrón porque son cosas distintas —el
 * padrón son los socios, esto son los que todavía no lo son— y porque el orden
 * importa: es una cola, de la más vieja a la más nueva.
 */
export const ApplicationsPage = () => {
    const [page, setPage] = useState(1)
    const { data, isLoading, isError, isPlaceholderData } = useApplications({ page, limit: 20 })
    // Resolver una solicitud la saca de la cola: aprobar o rechazar la última
    // de la página 2 dejaba "No hay solicitudes esperando" con la página 1
    // llena y sin paginación para volver.
    const { isSettling } = usePageInRange({ page, data, isPlaceholderData, onPageChange: setPage })

    const applications = data?.items ?? []

    return (
        <>
            <AdminPageHeader
                kicker="Gestión"
                title="Solicitudes"
                description="Las afiliaciones que esperan revisión, de la más vieja a la más nueva. Al aprobar se asigna el número de socio: antes no existe."
            />

            <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                {isLoading || isSettling ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar las solicitudes. Probá recargar en unos minutos.
                    </p>
                ) : applications.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 p-12 text-center">
                        <Inbox className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            No hay solicitudes esperando. Cuando alguien presente la suya, va a
                            aparecer acá.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Persona</TableHead>
                                <TableHead>CUIL</TableHead>
                                <TableHead>DNI</TableHead>
                                <TableHead>Presentada</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((application) => (
                                <TableRow key={application.id}>
                                    <TableCell>
                                        <p className="font-semibold text-ink">
                                            {application.name} {application.surname}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {application.email ?? 'Sin cuenta'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="font-mono text-muted-foreground">
                                        {formatCuil(application.cuil) || '—'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {application.dni ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {application.applicationSubmittedAt
                                            ? formatCalendarDate(application.applicationSubmittedAt)
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ApplicationReviewDialog application={application} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {data && !isSettling && (
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
