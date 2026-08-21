import { Link, useSearchParams } from 'react-router'
import { Check, FileText, Loader2, ReceiptText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate, formatMoney, formatPaymentMonth } from '@/lib/format'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { FilterPills } from '@/components/custom/FilterPills'
import { Pagination } from '@/components/custom/Pagination'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import {
    PaymentStatuses,
    summarizeConcepts,
    summarizeMonths,
    type PaymentStatus,
} from '@/payments/interfaces/Payment'
import { useAuthStore } from '@/auth/store/auth.store'
import { Roles } from '@/constants/roles'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { RejectPaymentDialog } from '../components/RejectPaymentDialog'
import { RevertPaymentDialog } from '../components/RevertPaymentDialog'
import { useAdminPayments, useApprovePayment } from '../hooks/useAdminPayments'
import type { AdminPayment } from '../interfaces/AdminPayment'

/**
 * Se deriva del union real en vez de re-escribir los literales: si mañana se
 * renombra un estado, esto deja de compilar en vez de mandar al backend un
 * status que no existe.
 *
 * Acá vivía un `Exclude<PaymentStatus, 'REFUNDED'>` de cuando ese estado existía.
 * Ojo si aparece algo parecido: `Exclude` acepta cualquier segundo parámetro, así
 * que al eliminarse el estado del union la línea NO dejó de compilar — quedó como
 * un no-op silencioso y el comentario mintiendo. Hay que limpiarlo a mano.
 */
type StatusTab = PaymentStatus | 'all'

const TABS: readonly { value: StatusTab; label: string }[] = [
    { value: PaymentStatuses.PENDING, label: 'Pendientes' },
    { value: PaymentStatuses.APPROVED, label: 'Aprobados' },
    { value: PaymentStatuses.REJECTED, label: 'Rechazados' },
    // Aparte de "Rechazados" y no mezclado con ellos: son los que SÍ se
    // acreditaron y después volvieron. Conciliando, esa es la diferencia entre
    // una plata que nunca entró y una que entró y se fue.
    { value: PaymentStatuses.REVERTED, label: 'Revertidos' },
    { value: 'all', label: 'Todos' },
]

/**
 * Quién pagó, tolerando que no haya nadie.
 *
 * `user` es nullable: un cobro de mostrador puede no tener cuenta detrás —la
 * plata la recibió el club igual, y a quién se le acreditó lo dicen las líneas—.
 * Acá se leía `payment.user.name` directo, y esa fila rompía la página entera.
 */
const fullName = (payment: AdminPayment) => {
    // Sin cuenta y con la ficha en blanco no son lo mismo: el primero es un
    // cobro de mostrador, el segundo un socio al que le falta cargar el nombre.
    if (!payment.user) return 'Mostrador'

    return `${payment.user.name ?? ''} ${payment.user.surname ?? ''}`.trim() || 'Socio'
}

const PAGE_SIZE = 20

/** Por defecto Pendientes: es lo que tesorería viene a resolver. */
const DEFAULT_TAB: StatusTab = PaymentStatuses.PENDING

const parseTab = (value: string | null): StatusTab =>
    TABS.find((option) => option.value === value)?.value ?? DEFAULT_TAB

const parsePage = (value: string | null): number => {
    const page = Number(value)
    return Number.isInteger(page) && page > 0 ? page : 1
}

export const PaymentsPage = () => {
    /*
     * La pestaña y la página viven en la URL, no en `useState`.
     *
     * Desde acá se sale seguido —al verificador del recibo, y de ahí a
     * corregirlo o anularlo—, y con el estado en memoria volver significaba
     * aterrizar de nuevo en "Pendientes", página 1, y tener que rehacer el
     * camino. Con la pestaña en la query, `/admin/pagos?estado=APPROVED` es una
     * dirección de verdad: el botón de atrás del navegador la restaura sola, se
     * puede compartir, y recargar no pierde nada.
     */
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = parseTab(searchParams.get('estado'))
    const page = parsePage(searchParams.get('pagina'))

    const updateParams = (next: { estado?: StatusTab; pagina?: number }) => {
        const params = new URLSearchParams(searchParams)
        const estado = next.estado ?? tab
        const pagina = next.pagina ?? 1

        // Los valores por defecto no se escriben: `/admin/pagos` a secas tiene
        // que seguir significando "pendientes, página 1".
        if (estado === DEFAULT_TAB) params.delete('estado')
        else params.set('estado', estado)

        if (pagina === 1) params.delete('pagina')
        else params.set('pagina', String(pagina))

        // `replace` para que cambiar de pestaña no apile una entrada por click:
        // el atrás tiene que volver a la pantalla anterior, no recorrer los
        // filtros que se fueron probando.
        setSearchParams(params, { replace: true })
    }

    // Con StatusTab derivado del union, el narrowing de `!== 'all'` alcanza:
    // ya no hace falta castear a PaymentStatus.
    const { data, isLoading, isError, isPlaceholderData } = useAdminPayments({
        page,
        limit: PAGE_SIZE,
        status: tab === 'all' ? undefined : tab,
    })

    const payments = data?.items ?? []
    const approveMutation = useApprovePayment()
    const { open: openReceipt, openingId } = useOpenPrivateFile()

    // Revertir es la única operación de este controller que NO es de tesorería:
    // deshace cobertura ya acreditada, así que el backend la limita a ADMIN. Sin
    // este chequeo, a tesorería se le ofrecía un botón que siempre da 403.
    const is = useAuthStore((state) => state.is)
    const canRevert = is(Roles.ADMIN)

    return (
        <>
            <AdminPageHeader kicker="Gestión" title="Pagos" />

            <div className="mb-5">
                <FilterPills
                    options={TABS}
                    value={tab}
                    // Al cambiar de pestaña la página vuelve a 1: la anterior
                    // deja de tener sentido porque el filtro nuevo tiene su
                    // propio total. Es el default de `updateParams`.
                    onChange={(estado) => updateParams({ estado })}
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
                                {/* Aprobar un pago extiende UNA de las tres
                                    coberturas. Sin esta columna, tesorería no
                                    sabe cuál está por mover: dos filas del mismo
                                    socio y el mismo mes se ven idénticas. */}
                                <TableHead>Concepto</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Monto</TableHead>
                                {/* Conciliando, "por dónde entró" es tan
                                    importante como cuánto: sin esta columna un
                                    pago de Mercado Pago y un cobro de mostrador
                                    se ven igual —los dos sin comprobante y ya
                                    resueltos—. */}
                                <TableHead>Medio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Comprob.</TableHead>
                                <TableHead>Recibo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <p className="font-semibold text-ink">{fullName(payment)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.user
                                                ? (payment.user.memberNumber
                                                      ? `N° ${payment.user.memberNumber}`
                                                      : payment.user.email)
                                                : 'Cobro sin cuenta'}
                                        </p>
                                    </TableCell>
                                    {/* Con el carrito, un comprobante puede cubrir
                                        a toda una familia: cuando hay más de una
                                        línea se muestra el conteo, y el detalle
                                        por persona vive en el pago. */}
                                    <TableCell className="text-muted-foreground">
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
                                    {/* `methodLabel` viene armado del servidor:
                                        es el mismo texto que sale en el recibo
                                        del socio y en la validación del QR. */}
                                    <TableCell className="text-muted-foreground">
                                        {payment.methodLabel}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatusBadge status={payment.status} />
                                        {/* El motivo, en la pestaña donde importa:
                                            "Revertidos" sin decir por qué no le
                                            sirve a nadie conciliando. Va acá y no
                                            en las acciones porque es parte del
                                            estado, no de lo que se puede hacer. */}
                                        {payment.status === PaymentStatuses.REVERTED &&
                                            payment.revertReason && (
                                                <p className="mt-1 max-w-64 text-xs text-destructive">
                                                    {payment.revertReason}
                                                </p>
                                            )}
                                    </TableCell>
                                    <TableCell>
                                        {payment.receiptUrl ? (
                                            <button
                                                type="button"
                                                disabled={openingId === payment.id}
                                                onClick={() =>
                                                    void openReceipt(payment.id, payment.receiptUrl)
                                                }
                                                className="inline-flex cursor-pointer items-center gap-1 text-sm text-brand hover:underline disabled:opacity-50"
                                            >
                                                {openingId === payment.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <FileText className="size-4" />
                                                )}
                                                Ver
                                            </button>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>

                                    {/* El recibo QUE EMITIÓ EL CLUB, que no es
                                        el comprobante de al lado: ése es la
                                        foto de la transferencia que subió el
                                        socio. Tesorería necesita los dos, y el
                                        que le van a pedir en el mostrador es
                                        éste.

                                        Va al verificador y no a una pantalla
                                        nueva porque ahí ya está todo: el
                                        detalle congelado, quién lo emitió, y
                                        las acciones de corregir y anular. */}
                                    <TableCell>
                                        {payment.receipt ? (
                                            <Link
                                                to={`/admin/verificar-recibo/${payment.receipt.verificationCode}`}
                                                className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                                            >
                                                <ReceiptText className="size-4" />
                                                N° {payment.receipt.number}
                                                {payment.receipt.status === 'voided' && (
                                                    <span className="text-warning">(anulado)</span>
                                                )}
                                            </Link>
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
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {payment.validatedBy
                                                        ? `por ${payment.validatedBy.name ?? payment.validatedBy.email}`
                                                        : '—'}
                                                </span>
                                                {/* Solo sobre un pago APROBADO:
                                                    sobre uno pendiente el backend
                                                    responde 400 diciendo que lo
                                                    que corresponde es rechazarlo,
                                                    y sobre uno ya revertido no
                                                    hay nada que deshacer. */}
                                                {canRevert &&
                                                    payment.status ===
                                                        PaymentStatuses.APPROVED && (
                                                        <RevertPaymentDialog
                                                            paymentId={payment.id}
                                                            memberName={fullName(payment)}
                                                            amount={payment.amount}
                                                            receiptNumber={payment.receipt?.number}
                                                        />
                                                    )}
                                            </div>
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
                        onPageChange={(pagina) => updateParams({ pagina })}
                        disabled={isPlaceholderData}
                    />
                </div>
            )}
        </>
    )
}
