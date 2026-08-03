import { Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate } from '@/lib/format'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { RoleBadges } from '../components/RoleBadges'
import { StaffFormDialog } from '../components/StaffFormDialog'
import { EditRolesDialog } from '../components/EditRolesDialog'
import { useStaff } from '../hooks/useStaff'

export const StaffPage = () => {
    const { staff, isLoading, isError } = useStaff()

    return (
        <>
            <AdminPageHeader
                kicker="Gestión"
                title="Administradores"
                description="Personal del club: administradores, tesorería, admins web y recepción."
                actions={<StaffFormDialog />}
            />

            <div className="rounded-xl border bg-card shadow-soft">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar los administradores. Probá recargar en unos minutos.
                    </p>
                ) : staff.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        Todavía no hay administradores cargados.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Alta</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-semibold text-ink">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <RoleBadges roles={user.roles} />
                                    </TableCell>
                                    <TableCell>
                                        {user.isEmailVerified ? (
                                            <Badge variant="success">Activo</Badge>
                                        ) : (
                                            <Badge variant="warning">Invitación pendiente</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatCalendarDate(user.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditRolesDialog
                                            user={user}
                                            trigger={
                                                <Button variant="ghost" size="sm">
                                                    <Pencil /> Roles
                                                </Button>
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </>
    )
}
