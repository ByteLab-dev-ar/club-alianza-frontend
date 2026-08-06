import { CalendarClock, Clock, FileText, Loader2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate, formatMoney, formatMonth, formatPaymentMonth } from '@/lib/format'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { PaymentStatuses } from '../interfaces/Payment'
import { useMyPayments, useNextDue } from '../hooks/useMyPayments'
import { PaymentStatusBadge } from '../components/PaymentStatusBadge'
import { UploadPaymentDialog } from '../components/UploadPaymentDialog'

export const MyPaymentsPage = () => {
    const { data: payments = [], isLoading, isError } = useMyPayments()
    const { data: nextDue, isError: isNextDueError } = useNextDue()
    const { open: openReceipt, openingId } = useOpenPrivateFile()

    const sorted = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="kicker text-brand">Pagos</p>
                    <h1 className="text-display mt-2 text-3xl text-ink">Mis pagos</h1>
                </div>
                <UploadPaymentDialog />
            </div>

            {/* El período lo decide el servidor: acá solo se informa. */}
            {nextDue?.canPay === true && (
                <div className="flex items-start gap-3 rounded-xl border bg-accent p-4">
                    <CalendarClock className="mt-0.5 size-5 shrink-0 text-accent-foreground" />
                    <p className="text-sm leading-relaxed text-accent-foreground">
                        Estás pagando:{' '}
                        <strong className="font-bold">{formatMonth(nextDue.month)}</strong>. Si
                        debés más de un mes, subí un solo comprobante por el total que te indique
                        el club.
                    </p>
                </div>
            )}

            {nextDue?.canPay === false && (
                <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
                    <Clock className="mt-0.5 size-5 shrink-0 text-warning" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Ya tenés un comprobante esperando revisión
                        {nextDue.month && (
                            <>
                                {' '}
                                por la cuota de{' '}
                                <strong className="text-foreground">
                                    {formatMonth(nextDue.month)}
                                </strong>
                            </>
                        )}
                        . Te avisamos cuando el club lo valide; mientras tanto no hace falta
                        subir otro.
                    </p>
                </div>
            )}

            {isNextDueError && (
                <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
                    No pudimos consultar qué período te toca pagar. Probá recargar la página.
                </p>
            )}

            {isLoading && <Skeleton className="h-64 rounded-xl" />}

            {isError && (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    No pudimos cargar tus pagos. Probá recargar en unos minutos.
                </p>
            )}

            {!isLoading && !isError && sorted.length === 0 && (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Todavía no cargaste ningún comprobante.
                </p>
            )}

            {sorted.length > 0 && (
                <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mes</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Comprobante</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-semibold text-ink">
                                        {formatPaymentMonth(payment.metadataMonth)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatCalendarDate(payment.paymentDate)}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatMoney(payment.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatusBadge status={payment.status} />
                                        {payment.status === PaymentStatuses.REJECTED &&
                                            payment.rejectionReason && (
                                                <p className="mt-1 text-xs text-destructive">
                                                    {payment.rejectionReason}
                                                </p>
                                            )}
                                    </TableCell>
                                    <TableCell>
                                        {payment.receiptUrl ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={openingId === payment.id}
                                                onClick={() =>
                                                    void openReceipt(payment.id, payment.receiptUrl)
                                                }
                                            >
                                                {openingId === payment.id ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <FileText />
                                                )}
                                                Ver
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
