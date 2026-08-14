import { CalendarClock, CircleCheck, Clock, FileText, Loader2, TriangleAlert } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate, formatMoney, formatMonth, formatPaymentMonth } from '@/lib/format'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { PaymentStatuses, summarizeConcepts, summarizeMonths } from '../interfaces/Payment'
import { useMyPayments, useNextDue } from '../hooks/useMyPayments'
import { PaymentStatusBadge } from '../components/PaymentStatusBadge'
import { PaymentCartDialog } from '../components/PaymentCartDialog'

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
                <PaymentCartDialog />
            </div>

            {/*
             * `canPay: false` tiene tres motivos que no significan lo mismo, y
             * antes los tres caían en el mismo cartel de "ya tenés un comprobante
             * esperando revisión" — que para alguien al día, o para un moroso,
             * es directamente falso. Se distinguen mirando los otros campos, en
             * este orden: la morosidad manda sobre todo lo demás.
             */}
            {nextDue?.delinquentSince && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Figurás como moroso desde{' '}
                        <strong className="text-foreground">
                            {formatCalendarDate(nextDue.delinquentSince)}
                        </strong>
                        , así que el pago por la app está deshabilitado. Acercate a la sede
                        para regularizar: seguís entrando al club y viendo todo tu historial
                        acá.
                    </p>
                </div>
            )}

            {/* El período lo decide el servidor: acá solo se informa. */}
            {nextDue?.canPay === true && nextDue.month && (
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

            {nextDue?.canPay === false && !nextDue.delinquentSince && nextDue.pendingPaymentId && (
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

            {/* Sin período y sin nada pendiente: está todo pago. No se puede
                pagar por adelantado, así que hasta el mes que viene no hay nada
                que hacer acá. */}
            {nextDue?.canPay === false &&
                !nextDue.delinquentSince &&
                !nextDue.pendingPaymentId &&
                !nextDue.month && (
                    <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Estás al día: tenés el mes corriente cubierto. El período que viene
                            se habilita cuando arranque el mes.
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
                                {/* La cuota dejó de ser una sola cosa: sin esta
                                    columna, el pago de la actividad y el de la
                                    membresía del mismo mes son dos filas
                                    idénticas. */}
                                <TableHead>Concepto</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Comprobante</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sorted.map((payment) => (
                                <TableRow key={payment.id}>
                                    {/* Un pago puede cubrir a varias personas y
                                        varios meses: los resúmenes devuelven el
                                        valor tal cual cuando hay una sola línea
                                        —el caso de siempre— y lo cuentan cuando
                                        hay más. */}
                                    <TableCell className="font-semibold text-ink">
                                        {formatPaymentMonth(summarizeMonths(payment))}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {summarizeConcepts(payment) ?? '—'}
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
