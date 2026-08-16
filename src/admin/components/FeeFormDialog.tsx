import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { FormDialog } from '@/components/custom/FormDialog'
import { TextField } from '@/components/custom/TextField'
import { SelectField } from '@/components/custom/SelectField'
import { moneyField } from '@/shared/schemas/fields'
import { formatMonth } from '@/lib/format'
import { PAYMENT_CONCEPT_LABELS, PaymentConcepts } from '@/payments/interfaces/Payment'
import { useCreateFee, useUpdateFee } from '../hooks/useFees'
import type { Fee } from '../interfaces/Fee'

const CONCEPT_OPTIONS = Object.entries(PAYMENT_CONCEPT_LABELS).map(([value, label]) => ({
    value,
    label,
}))

const feeSchema = z.object({
    concept: z.enum(PaymentConcepts),
    effectiveFrom: z.string().regex(/^\d{4}-\d{2}$/, 'Elegí el mes desde el que rige'),
    amount: moneyField,
})

type FeeSchema = z.infer<typeof feeSchema>

/**
 * El mes siguiente al de hoy, que es el primero que se puede elegir.
 *
 * Se calcula acá SOLO para el `min` del input y el default: quien decide de
 * verdad es el servidor, que rechaza el mes en curso con un 409 —salvo cuando
 * es el primer monto de ese concepto, donde sí lo acepta—. No es lo mismo que
 * calcular un precio en el cliente.
 */
const nextMonthKey = (): string => {
    const today = new Date()
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

interface Props {
    /** Presente = corrección de un monto que todavía no rige. */
    fee?: Fee
    trigger?: React.ReactNode
}

/**
 * Cargar o corregir un monto (§5.5).
 *
 * En edición el concepto y el mes quedan bloqueados: el backend solo acepta el
 * importe, porque mover un precio de lugar es borrar uno y crear otro. Y toda la
 * pantalla insiste en la regla que gobierna esto — **rige desde el mes siguiente
 * y nunca toca el mes en curso**—, porque es lo que hace que un recibo ya
 * emitido no cambie nunca de importe.
 */
export const FeeFormDialog = ({ fee, trigger }: Props) => {
    const isEdit = !!fee

    const createMutation = useCreateFee()
    const updateMutation = useUpdateFee()

    const buildDefaults = (): FeeSchema => ({
        concept: fee?.concept ?? PaymentConcepts.MEMBERSHIP,
        effectiveFrom: fee?.effectiveFrom ?? nextMonthKey(),
        amount: fee?.amount ?? 0,
    })

    const form = useForm<FeeSchema>({
        resolver: zodResolver(feeSchema),
        defaultValues: buildDefaults(),
    })

    const onSubmit = (values: FeeSchema) =>
        isEdit
            ? updateMutation.mutateAsync({ id: fee.id, amount: values.amount })
            : createMutation.mutateAsync(values)

    return (
        <FormDialog
            form={form}
            buildDefaults={buildDefaults}
            onSubmit={onSubmit}
            title={isEdit ? 'Corregir el monto' : 'Cargar un monto'}
            description={
                isEdit
                    ? 'Todavía no empezó a regir, así que se puede corregir. El concepto y el mes no se cambian: para eso se borra y se carga otro.'
                    : 'Rige desde el mes que elijas y nunca toca el mes en curso: lo que ya se cobró queda como se cobró.'
            }
            trigger={trigger}
            triggerLabel="Cargar monto"
            submitLabel={isEdit ? 'Guardar' : 'Cargar'}
            successMessage={isEdit ? 'Monto corregido' : 'Monto cargado'}
            errorFallback="No pudimos guardar el monto"
            isPending={createMutation.isPending || updateMutation.isPending}
        >
            <SelectField
                control={form.control}
                name="concept"
                label="Concepto"
                options={CONCEPT_OPTIONS}
                disabled={isEdit}
            />

            <TextField
                control={form.control}
                name="effectiveFrom"
                label="Rige desde"
                type="month"
                disabled={isEdit}
                description={
                    isEdit
                        ? `Empieza a regir en ${formatMonth(fee.effectiveFrom)}.`
                        : 'El mes en curso no se puede tocar: lo que ya se está cobrando no cambia.'
                }
            />

            <TextField
                control={form.control}
                name="amount"
                label="Importe"
                type="number"
                min={0}
                step="0.01"
                placeholder="15000"
            />
        </FormDialog>
    )
}
