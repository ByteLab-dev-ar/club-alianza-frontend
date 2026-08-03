import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import type { HistoryMilestone } from '@/institutional/interfaces/Institutional'
import { useCreateMilestone, useUpdateMilestone } from '../hooks/useAdminInstitutional'

const milestoneSchema = z.object({
    year: z.coerce
        .number<number>()
        .int('Año inválido')
        .min(1800, 'No puede ser anterior a 1800')
        .max(2100, 'No puede ser posterior a 2100'),
    title: z.string().min(2, 'Mínimo 2 caracteres').max(120),
    description: z.string().min(2, 'Contá algo del hito').max(2000),
})

type MilestoneSchema = z.infer<typeof milestoneSchema>

interface Props {
    milestone?: HistoryMilestone
    trigger?: React.ReactNode
}

export const MilestoneFormDialog = ({ milestone, trigger }: Props) => {
    const isEdit = !!milestone

    const createMutation = useCreateMilestone()
    const updateMutation = useUpdateMilestone(milestone?.id ?? '')

    const buildDefaults = (): MilestoneSchema => ({
        year: milestone?.year ?? new Date().getFullYear(),
        title: milestone?.title ?? '',
        description: milestone?.description ?? '',
    })

    const form = useForm<MilestoneSchema>({
        resolver: zodResolver(milestoneSchema),
        defaultValues: buildDefaults(),
    })

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={(values) =>
                isEdit ? updateMutation.mutateAsync(values) : createMutation.mutateAsync(values)
            }
            title={isEdit ? 'Editar hito' : 'Nuevo hito'}
            trigger={trigger}
            triggerLabel="Nuevo hito"
            submitLabel={isEdit ? 'Guardar' : 'Crear hito'}
            successMessage={isEdit ? 'Hito actualizado' : 'Hito creado'}
            errorFallback="No pudimos guardar el hito"
            isPending={createMutation.isPending || updateMutation.isPending}
        >
            <TextField control={form.control} name="year" label="Año" type="number" />
            <TextField
                control={form.control}
                name="title"
                label="Título"
                placeholder="Ej. Fundación"
            />
            <TextField control={form.control} name="description" label="Descripción" multiline />
        </FormDialog>
    )
}
