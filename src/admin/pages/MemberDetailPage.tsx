import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Pencil, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { formatCalendarDate } from '@/lib/format'
import { MemberStatusBadge } from '../components/MemberStatusBadge'
import { MemberFormDialog } from '../components/MemberFormDialog'
import { MemberDocuments } from '../components/MemberDocuments'
import { useDeleteMember, useMember } from '../hooks/useMembers'

const DataRow = ({ label, value }: { label: string; value: string | null }) => (
    <div className="flex flex-col gap-1">
        <p className="kicker text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-ink">{value || '—'}</p>
    </div>
)

export const MemberDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: member, isLoading, isError } = useMember(id)
    const deleteMutation = useDeleteMember()

    if (isLoading) return <Skeleton className="h-96 rounded-xl" />

    if (isError || !member) {
        return (
            <div className="rounded-xl border border-dashed bg-card p-12 text-center">
                <p className="text-sm text-muted-foreground">No encontramos a este socio.</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link to="/admin/socios">Volver al listado</Link>
                </Button>
            </div>
        )
    }

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(member.id)
            toast.success('Socio eliminado')
            navigate('/admin/socios')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos eliminar al socio'))
        }
    }

    return (
        <>
            <Link
                to="/admin/socios"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-4" /> Socios
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    {member.urlPhoto ? (
                        <img
                            src={member.urlPhoto}
                            alt=""
                            className="size-16 rounded-full border-2 border-accent object-cover"
                        />
                    ) : (
                        <span className="grid size-16 place-items-center rounded-full bg-accent text-secondary">
                            <User className="size-8" />
                        </span>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-display text-2xl text-ink">
                                {member.name} {member.surname}
                            </h1>
                            <MemberStatusBadge isActive={member.isActive} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {member.memberNumber ? `Socio N° ${member.memberNumber} · ` : ''}
                            {member.email}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <MemberFormDialog
                        member={member}
                        trigger={
                            <Button variant="outline">
                                <Pencil /> Editar
                            </Button>
                        }
                    />
                    <ConfirmDialog
                        trigger={
                            <Button variant="ghost" className="text-destructive hover:bg-destructive/10">
                                <Trash2 /> Eliminar
                            </Button>
                        }
                        title="Eliminar socio"
                        description={`Se dará de baja a ${member.name} ${member.surname} y perderá el acceso al portal. Esta acción se puede revertir reactivando la cuenta.`}
                        confirmLabel="Eliminar socio"
                        destructive
                        onConfirm={handleDelete}
                    />
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-card p-6 shadow-soft lg:col-span-2">
                    <h2 className="font-display text-lg font-bold text-ink">Datos del socio</h2>
                    <Separator className="my-4" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <DataRow label="DNI" value={member.dni} />
                        <DataRow label="Teléfono" value={member.phone} />
                        <DataRow label="Domicilio" value={member.address} />
                        <DataRow
                            label="Fecha de nacimiento"
                            value={member.bornDate ? formatCalendarDate(member.bornDate) : null}
                        />
                        <DataRow
                            label="Socio desde"
                            value={member.memberSince ? formatCalendarDate(member.memberSince) : null}
                        />
                        <DataRow
                            label="Vencimiento de cuota"
                            value={
                                member.expirationDate ? formatCalendarDate(member.expirationDate) : null
                            }
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <h2 className="font-display text-lg font-bold text-ink">Documentación</h2>
                    <Separator className="my-4" />
                    <MemberDocuments memberId={member.id} />
                </div>
            </div>
        </>
    )
}
