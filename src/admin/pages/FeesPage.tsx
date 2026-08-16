import { Pencil, Trash2, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { formatCalendarDate, formatMoney, formatMonth } from '@/lib/format'
import {
    PAYMENT_CONCEPT_LABELS,
    PaymentConcepts,
    type PaymentConcept,
} from '@/payments/interfaces/Payment'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { FeeFormDialog } from '../components/FeeFormDialog'
import { useCurrentFees, useDeleteFee, useFees } from '../hooks/useFees'

const CONCEPTS = Object.values(PaymentConcepts)

/**
 * Lo que rige hoy, por concepto.
 *
 * `null` **no es cero**: significa que el club todavía no cargó ese precio, y
 * sin monto cargado ese concepto no se puede cobrar — el carrito directamente no
 * lo ofrece. Por eso se pinta como una alerta y no como un guion.
 */
const CurrentFeeCard = ({ concept, amount }: { concept: PaymentConcept; amount: number | null }) => (
    <div className="rounded-xl border bg-card p-6 shadow-soft">
        <p className="kicker text-muted-foreground">{PAYMENT_CONCEPT_LABELS[concept]}</p>
        {amount === null ? (
            <>
                <p className="mt-3 flex items-center gap-2 font-display text-lg font-bold text-warning">
                    <TriangleAlert className="size-4.5 shrink-0" />
                    Sin cargar
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sin un monto cargado, este concepto no se puede cobrar.
                </p>
            </>
        ) : (
            <>
                <p className="text-display mt-3 text-2xl text-ink">{formatMoney(amount)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Es lo que rige este mes.</p>
            </>
        )}
    </div>
)

/**
 * Los montos de la cuota (§5.5), para ADMIN y tesorería.
 *
 * Entra al alcance porque sin esto el club depende de un desarrollador para cada
 * aumento. La regla que gobierna toda la pantalla es una sola: **un cambio rige
 * desde el mes siguiente y nunca toca el mes en curso**. De ahí sale que un
 * recibo ya emitido jamás cambie de importe.
 */
export const FeesPage = () => {
    const { data: current, isLoading: isLoadingCurrent } = useCurrentFees()
    const { data: fees = [], isLoading, isError } = useFees()
    const { mutateAsync: deleteFee } = useDeleteFee()

    return (
        <>
            <AdminPageHeader
                kicker="Cobros"
                title="Montos de la cuota"
                description="Un cambio de monto rige desde el mes siguiente y nunca toca el mes en curso: lo que ya se cobró queda como se cobró."
                actions={<FeeFormDialog />}
            />

            <div className="mb-8 grid gap-5 sm:grid-cols-3">
                {isLoadingCurrent
                    ? CONCEPTS.map((concept) => (
                          <Skeleton key={concept} className="h-32 rounded-xl" />
                      ))
                    : CONCEPTS.map((concept) => (
                          <CurrentFeeCard
                              key={concept}
                              concept={concept}
                              amount={current?.[concept] ?? null}
                          />
                      ))}
            </div>

            <div className="rounded-xl border bg-card shadow-soft">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar los montos. Probá recargar en unos minutos.
                    </p>
                ) : fees.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        Todavía no hay ningún monto cargado. Hasta que lo haya, no se puede
                        cobrar la cuota.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Rige desde</TableHead>
                                <TableHead>Importe</TableHead>
                                <TableHead>Cargado por</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell className="font-semibold text-ink">
                                        {PAYMENT_CONCEPT_LABELS[fee.concept]}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground">
                                            {formatMonth(fee.effectiveFrom)}
                                        </span>
                                        {/* `isEditable` separa lo que todavía se
                                            puede corregir de lo que ya es
                                            historia, y esa distinción vale la
                                            etiqueta: un precio que ya rige no se
                                            edita ni se borra jamás. */}
                                        {fee.isEditable && (
                                            <Badge variant="soft" className="ml-2">
                                                Todavía no rige
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatMoney(fee.amount)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <p className="text-sm">{fee.setByName ?? '—'}</p>
                                        <p className="text-xs">
                                            {formatCalendarDate(fee.createdAt)}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {fee.isEditable ? (
                                            <div className="flex justify-end gap-1">
                                                <FeeFormDialog
                                                    fee={fee}
                                                    trigger={
                                                        <Button variant="ghost" size="sm">
                                                            <Pencil /> Corregir
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
                                                    title="Borrar el monto"
                                                    description="Todavía no empezó a regir, así que no afectó ningún cobro. Se puede volver a cargar cuando quieras."
                                                    confirmLabel="Borrar"
                                                    destructive
                                                    onConfirm={async () => {
                                                        await deleteFee(fee.id)
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Ya rigió
                                            </span>
                                        )}
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
