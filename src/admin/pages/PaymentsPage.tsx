import { useState } from 'react'
import { Check, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getApiErrorMessage } from '@/api/clubApi'
import { formatCalendarDate, formatMoney } from '@/lib/format'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import { PaymentStatuses, type PaymentStatus } from '@/payments/interfaces/Payment'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { RejectPaymentDialog } from '../components/RejectPaymentDialog'
import { useAdminPayments, useApprovePayment } from '../hooks/useAdminPayments'

type StatusTab = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'

const TABS: { value: StatusTab; label: string }[] = [
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'APPROVED', label: 'Aprobados' },
    { value: 'REJECTED', label: 'Rechazados' },
    { value: 'all', label: 'Todos' },
]

const fullName = (payment: { user: { name: string | null; surname: string | null } }) =>
    `${payment.user.name ?? ''} ${payment.user.surname ?? ''}`.trim() || 'Socio'

export const PaymentsPage = () => {
    // Por defecto arranca en Pendientes: es lo que tesorería viene a resolver.
    const [tab, setTab] = useState<StatusTab>('PENDING')

    const { data: payments = [], isLoading, isError } = useAdminPayments({
        status: tab === 'all' ? undefined : (tab as PaymentStatus),
    })

    const approveMutation = useApprovePayment()

    const approve = async (paymentId: string) => {
        try {
            await approveMutation.mutateAsync(paymentId)
            toast.success('Pago aprobado. Se actualizó el vencimiento del socio.')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos aprobar el pago'))
        }
    }

    return (
        <>
            <AdminPageHeader kicker="Gestión" title="Pagos" />

            <div className="mb-5 flex gap-1 rounded-lg border bg-card p-1">
                {TABS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setTab(option.value)}
                        className={
                            tab === option.value
                                ? 'rounded-md bg-ink px-4 py-2 text-xs font-bold text-background'
                                : 'rounded-md px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground'
                        }
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border bg-card shadow-soft">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 rounded-lg" />
                        ))}
                    </div>
                ) : isError ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        No pudimos cargar los pagos. Probá recargar en unos minutos.
                    </p>
                ) : payments.length === 0 ? (
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        {tab === 'PENDING'
                            ? 'No hay pagos pendientes. ¡Todo al día!'
                            : 'No hay pagos en esta categoría.'}
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Socio</TableHead>
                                <TableHead>Mes</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Comprob.</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <p className="font-semibold text-ink">{fullName(payment)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.user.memberNumber
                                                ? `N° ${payment.user.memberNumber}`
                                                : payment.user.email}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {payment.metadataMonth ?? 'Cuota'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatCalendarDate(payment.paymentDate)}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {formatMoney(payment.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatusBadge status={payment.status} />
                                    </TableCell>
                                    <TableCell>
                                        {payment.receiptUrl ? (
                                            <a
                                                href={payment.receiptUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                                            >
                                                <FileText className="size-4" /> Ver
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {payment.status === PaymentStatuses.PENDING ? (
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-success hover:bg-success/10"
                                                    disabled={approveMutation.isPending}
                                                    onClick={() => void approve(payment.id)}
                                                >
                                                    {approveMutation.isPending &&
                                                    approveMutation.variables === payment.id ? (
                                                        <Loader2 className="animate-spin" />
                                                    ) : (
                                                        <Check />
                                                    )}
                                                    Aprobar
                                                </Button>
                                                <RejectPaymentDialog
                                                    paymentId={payment.id}
                                                    memberName={fullName(payment)}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {payment.validatedBy
                                                    ? `por ${payment.validatedBy.name ?? payment.validatedBy.email}`
                                                    : '—'}
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
