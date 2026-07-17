import { FileText } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatCalendarDate, formatMoney } from '@/lib/format'
import { useMyPayments } from '../hooks/useMyPayments'
import { PaymentStatusBadge } from '../components/PaymentStatusBadge'
import { UploadPaymentDialog } from '../components/UploadPaymentDialog'

export const MyPaymentsPage = () => {
    const { data: payments = [], isLoading, isError } = useMyPayments()

    const sorted = [...payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="kicker text-secondary">Pagos</p>
                    <h1 className="text-display mt-2 text-3xl text-ink">Mis pagos</h1>
                </div>
                <UploadPaymentDialog />
            </div>

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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr className="text-left">
                                    <th className="kicker px-6 py-3 text-muted-foreground">Mes</th>
                                    <th className="kicker px-6 py-3 text-muted-foreground">Fecha</th>
                                    <th className="kicker px-6 py-3 text-muted-foreground">Monto</th>
                                    <th className="kicker px-6 py-3 text-muted-foreground">Estado</th>
                                    <th className="kicker px-6 py-3 text-muted-foreground">
                                        Comprobante
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sorted.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4 font-semibold text-ink">
                                            {payment.metadataMonth ?? 'Cuota'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {formatCalendarDate(payment.paymentDate)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">
                                            {formatMoney(payment.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentStatusBadge status={payment.status} />
                                            {payment.status === 'REJECTED' &&
                                                payment.rejectionReason && (
                                                    <p className="mt-1 text-xs text-destructive">
                                                        {payment.rejectionReason}
                                                    </p>
                                                )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.receiptUrl ? (
                                                <Button asChild variant="ghost" size="sm">
                                                    <a
                                                        href={payment.receiptUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <FileText /> Ver
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
