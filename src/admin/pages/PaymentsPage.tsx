import { useState } from 'react'
import { Check, FileText, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate, formatMoney } from '@/lib/format'
import { safeHttpUrl } from '@/lib/safe-url'
import { FilterPills } from '@/components/custom/FilterPills'
import { Pagination } from '@/components/custom/Pagination'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import { PaymentStatuses, type PaymentStatus } from '@/payments/interfaces/Payment'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { RejectPaymentDialog } from '../components/RejectPaymentDialog'
import { useAdminPayments, useApprovePayment } from '../hooks/useAdminPayments'

/**
 * Se deriva del union real en vez de re-escribir los literales: si mañana se
 * renombra un estado, esto deja de compilar en vez de mandar al backend un
 * status que no existe. REFUNDED queda fuera a propósito —solo se ve en 'Todos'—
 * y el Exclude lo deja explícito.
 */
type StatusTab = Exclude<PaymentStatus, 'REFUNDED'> | 'all'

const TABS: readonly { value: StatusTab; label: string }[] = [
    { value: PaymentStatuses.PENDING, label: 'Pendientes' },
    { value: PaymentStatuses.APPROVED, label: 'Aprobados' },
    { value: PaymentStatuses.REJECTED, label: 'Rechazados' },
    { value: 'all', label: 'Todos' },
]

const fullName = (payment: { user: { name: string | null; surname: string | null } }) =>
    `${payment.user.name ?? ''} ${payment.user.surname ?? ''}`.trim() || 'Socio'

const PAGE_SIZE = 20

export const PaymentsPage = () => {
    // Por defecto arranca en Pendientes: es lo que tesorería viene a resolver.
    const [tab, setTab] = useState<StatusTab>('PENDING')
    const [page, setPage] = useState(1)

    // Con StatusTab derivado del union, el narrowing de `!== 'all'` alcanza:
    // ya no hace falta castear a PaymentStatus.
    const { data, isLoading, isError, isPlaceholderData } = useAdminPayments({
        page,
        limit: PAGE_SIZE,
        status: tab === 'all' ? undefined : tab,
    })

    const payments = data?.items ?? []
    const approveMutation = useApprovePayment()

    return (
        <>
            <AdminPageHeader kicker="Gestión" title="Pagos" />

            <div className="mb-5">
                <FilterPills
                    options={TABS}
                    value={tab}
                    onChange={(next) => {
                        setTab(next)
                        // Al cambiar de pestaña la página anterior deja de tener
                        // sentido: el filtro nuevo tiene su propio total.
                        setPage(1)
                    }}
                />
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
                                                href={safeHttpUrl(payment.receiptUrl)}
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
                                                    onClick={() => approveMutation.mutate(payment.id)}
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

            {data && (
                <div className="mt-5">
                    <Pagination
                        meta={data.meta}
                        onPageChange={setPage}
                        disabled={isPlaceholderData}
                    />
                </div>
            )}
        </>
    )
}
