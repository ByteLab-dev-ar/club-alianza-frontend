import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { useHistory } from '@/institutional/hooks/useHistory'
import { useBoard } from '@/institutional/hooks/useBoard'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { MilestoneFormDialog } from '../components/MilestoneFormDialog'
import { BoardMemberFormDialog } from '../components/BoardMemberFormDialog'
import { BoardPeriodEditor } from '../components/BoardPeriodEditor'
import { useDeleteMilestone, useDeleteBoardMember } from '../hooks/useAdminInstitutional'

const HistoryTab = () => {
    const { data: milestones = [], isLoading } = useHistory()
    const deleteMutation = useDeleteMilestone()

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success('Hito eliminado')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos eliminar el hito'))
        }
    }

    if (isLoading) return <Skeleton className="h-64 rounded-xl" />

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <MilestoneFormDialog />
            </div>

            {milestones.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Todavía no hay hitos cargados.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {milestones.map((milestone) => (
                        <div
                            key={milestone.id}
                            className="flex items-start justify-between gap-4 rounded-xl border bg-card p-5 shadow-soft"
                        >
                            <div className="flex gap-4">
                                <span className="text-display text-2xl text-secondary">
                                    {milestone.year}
                                </span>
                                <div>
                                    <p className="font-display font-bold text-ink">
                                        {milestone.title}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {milestone.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <MilestoneFormDialog
                                    milestone={milestone}
                                    trigger={
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="size-4" />
                                        </Button>
                                    }
                                />
                                <ConfirmDialog
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    }
                                    title="Eliminar hito"
                                    description={`Se eliminará "${milestone.title}" (${milestone.year}).`}
                                    confirmLabel="Eliminar"
                                    destructive
                                    onConfirm={() => handleDelete(milestone.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const BoardTab = () => {
    const { data: board, isLoading } = useBoard()
    const deleteMutation = useDeleteBoardMember()

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success('Miembro eliminado')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos eliminar el miembro'))
        }
    }

    if (isLoading || !board) return <Skeleton className="h-64 rounded-xl" />

    const nextOrder = board.members.length
        ? Math.max(...board.members.map((member) => member.displayOrder)) + 1
        : 0

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-soft">
                <BoardPeriodEditor period={board.period} />
                <BoardMemberFormDialog nextOrder={nextOrder} />
            </div>

            {board.members.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Todavía no hay miembros en la comisión.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {board.members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-soft"
                        >
                            <div>
                                <p className="kicker text-secondary">{member.position}</p>
                                <p className="font-display font-bold text-ink">{member.fullName}</p>
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <BoardMemberFormDialog
                                    member={member}
                                    trigger={
                                        <Button variant="ghost" size="icon">
                                            <Pencil className="size-4" />
                                        </Button>
                                    }
                                />
                                <ConfirmDialog
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    }
                                    title="Quitar miembro"
                                    description={`Se quitará a ${member.fullName} (${member.position}) de la comisión.`}
                                    confirmLabel="Quitar"
                                    destructive
                                    onConfirm={() => handleDelete(member.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export const AdminInstitutionalPage = () => {
    return (
        <>
            <AdminPageHeader
                kicker="Contenido"
                title="Institucional"
                description="Editá la línea de tiempo de la historia y la comisión directiva."
            />

            <Tabs defaultValue="history">
                <TabsList>
                    <TabsTrigger value="history">Historia</TabsTrigger>
                    <TabsTrigger value="board">Comisión directiva</TabsTrigger>
                </TabsList>
                <TabsContent value="history" className="mt-6">
                    <HistoryTab />
                </TabsContent>
                <TabsContent value="board" className="mt-6">
                    <BoardTab />
                </TabsContent>
            </Tabs>
        </>
    )
}
