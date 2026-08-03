import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import type { BoardMember } from '@/institutional/interfaces/Institutional'
import { useCreateBoardMember, useUpdateBoardMember } from '../hooks/useAdminInstitutional'

const boardMemberSchema = z.object({
    position: z.string().min(2, 'Ingresá el cargo').max(60),
    fullName: z.string().min(2, 'Ingresá el nombre').max(80),
    displayOrder: z.coerce.number<number>().int().min(0).optional(),
})

type BoardMemberSchema = z.infer<typeof boardMemberSchema>

interface Props {
    member?: BoardMember
    /** Orden sugerido para el alta (último + 1). */
    nextOrder?: number
    trigger?: React.ReactNode
}

export const BoardMemberFormDialog = ({ member, nextOrder = 0, trigger }: Props) => {
    const isEdit = !!member

    const createMutation = useCreateBoardMember()
    const updateMutation = useUpdateBoardMember(member?.id ?? '')

    const buildDefaults = (): BoardMemberSchema => ({
        position: member?.position ?? '',
        fullName: member?.fullName ?? '',
        displayOrder: member?.displayOrder ?? nextOrder,
    })

    const form = useForm<BoardMemberSchema>({
        resolver: zodResolver(boardMemberSchema),
        defaultValues: buildDefaults(),
    })

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={(values) =>
                isEdit ? updateMutation.mutateAsync(values) : createMutation.mutateAsync(values)
            }
            title={isEdit ? 'Editar miembro' : 'Agregar miembro'}
            trigger={trigger}
            triggerLabel="Agregar miembro"
            submitLabel={isEdit ? 'Guardar' : 'Agregar'}
            successMessage={isEdit ? 'Miembro actualizado' : 'Miembro agregado'}
            errorFallback="No pudimos guardar el miembro"
            isPending={createMutation.isPending || updateMutation.isPending}
        >
            <TextField
                control={form.control}
                name="position"
                label="Cargo"
                placeholder="Ej. PRESIDENTE"
            />
            <TextField
                control={form.control}
                name="fullName"
                label="Nombre completo"
                placeholder="Ej. Ricardo Méndez"
            />
            <TextField
                control={form.control}
                name="displayOrder"
                label="Orden de aparición"
                type="number"
                min={0}
            />
        </FormDialog>
    )
}
