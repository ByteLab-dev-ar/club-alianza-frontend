import { useState } from 'react'
import { Calendar, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { Pagination } from '@/components/custom/Pagination'
import { formatCalendarDate } from '@/lib/format'
import { useEvents } from '@/events/hooks/useEvents'
import { useEventCategories } from '@/events/hooks/useEventCategories'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { EventFormDialog } from '../components/EventFormDialog'
import { CategoryManagerDialog } from '../components/CategoryManagerDialog'
import { useCreateEventCategory, useDeleteEvent, useDeleteEventCategory } from '../hooks/useAdminEvents'

const PAGE_SIZE = 20

export const AdminEventsPage = () => {
    const [page, setPage] = useState(1)
    // La agenda viene ordenada por fecha ascendente: sin paginar, pasados los
    // primeros eventos los nuevos no aparecían en el panel.
    const { data, isLoading, isError, isPlaceholderData } = useEvents({ page, limit: PAGE_SIZE })
    const { data: categories = [] } = useEventCategories()
    const deleteMutation = useDeleteEvent()
    const createCategory = useCreateEventCategory()
    const deleteCategory = useDeleteEventCategory()

    const events = data?.items ?? []

    return (
        <>
            <AdminPageHeader
                kicker="Contenido"
                title="Eventos"
                actions={
                    <>
                        <CategoryManagerDialog
                            title="Categorías de eventos"
                            categories={categories}
                            onCreate={(payload) => createCategory.mutateAsync(payload)}
                            onDelete={(id) => deleteCategory.mutateAsync(id)}
                            isMutating={createCategory.isPending}
                        />
                        <EventFormDialog />
                    </>
                }
            />

            <div className="rounded-xl border bg-card shadow-soft">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar los eventos. Probá recargar en unos minutos.
                    </p>
                ) : events.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        Todavía no hay eventos cargados.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Evento</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <p className="font-semibold text-ink">{event.title}</p>
                                        {/* Los dos son opcionales: sin esto, un
                                            evento sin hora mostraba " hs · " suelto. */}
                                        <p className="text-xs text-muted-foreground">
                                            {[
                                                event.time && `${event.time} hs`,
                                                event.location,
                                            ]
                                                .filter(Boolean)
                                                .join(' · ') || 'Sin hora ni lugar cargados'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Calendar className="size-3.5" />
                                            {formatCalendarDate(event.date)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {event.category ? (
                                            <span
                                                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                                                style={{
                                                    backgroundColor: `${event.category.color}1f`,
                                                    color: event.category.color,
                                                }}
                                            >
                                                {event.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <EventFormDialog
                                                event={event}
                                                trigger={
                                                    <Button variant="ghost" size="sm">
                                                        <Pencil /> Editar
                                                    </Button>
                                                }
                                            />
                                            <ConfirmDialog
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                }
                                                title="Eliminar evento"
                                                description={`Se eliminará "${event.title}" y su imagen. Esta acción no se puede deshacer.`}
                                                confirmLabel="Eliminar"
                                                destructive
                                                onConfirm={() => deleteMutation.mutateAsync(event.id)}
                                            />
                                        </div>
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
