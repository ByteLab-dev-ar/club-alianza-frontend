import { Link } from 'react-router'
import { FileText, Loader2, ReceiptText } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatCalendarDate, formatMoney, formatPaymentMonth } from '@/lib/format'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { paymentConceptLabel } from '@/payments/interfaces/Payment'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import { useAdminPayments } from '../hooks/useAdminPayments'

/** Las últimas del socio. La lista completa vive en la pantalla de pagos. */
const LIMIT = 10

interface Props {
    profileId: string
}

/**
 * Los pagos que le acreditaron cuotas a este socio, con su recibo.
 *
 * **Filtra por las líneas y no por quién pagó**, y esa es la diferencia que
 * hace útil la sección: con el carrito de §5.6 un tutor paga a sus tres hijos
 * con un solo comprobante, así que en la ficha del chico tiene que aparecer el
 * pago de la madre — es la prueba de que su cuota está paga.
 *
 * De ahí sale la advertencia del monto: el importe que se muestra es el TOTAL
 * de la operación y puede cubrir a más personas. Lo que le tocó a este socio
 * son sus líneas, que es lo que se lista debajo de cada fila.
 *
 * Y se muestran las dos cosas, que son distintas: el **comprobante** es la foto
 * de la transferencia que subió quien pagó, y el **recibo** es el papel que
 * emitió el club — el que le van a pedir en el mostrador.
 */
export const MemberPayments = ({ profileId }: Props) => {
    const { data, isLoading } = useAdminPayments({ profileId, limit: LIMIT })
    const { open: openReceipt, openingId } = useOpenPrivateFile()

    if (isLoading) {
        return <Skeleton className="h-40 rounded-xl" />
    }

    const payments = data?.items ?? []

    return (
        <section className="rounded-xl border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Pagos y recibos</h2>
            {/* El separador va desde que esta sección dejó de estar anidada
                adentro del card de Documentación: ahora es una tarjeta más de la
                ficha, y las otras separan el título del contenido igual. */}
            <Separator className="my-4" />

            {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Todavía no se le registró ningún pago.
                </p>
            ) : (
                <ul className="flex flex-col divide-y">
                    {payments.map((payment) => (
                        <li key={payment.id} className="py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold text-ink">
                                        {formatMoney(payment.amount)}
                                        {/* El medio va acá por el mismo motivo
                                            que en el listado de pagos: sin él,
                                            un pago de Mercado Pago y un cobro de
                                            mostrador se leen igual. */}
                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            {formatCalendarDate(payment.paymentDate)} ·{' '}
                                            {payment.methodLabel}
                                        </span>
                                    </p>
                                    {/* Qué se le acreditó A ÉL, que puede ser
                                        una parte del total: el pago del tutor
                                        cubre a varios. */}
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {payment.lines
                                            .filter((line) => line.profileId === profileId)
                                            .map(
                                                (line) =>
                                                    `${paymentConceptLabel(line.concept)} ${formatPaymentMonth(line.month)}`,
                                            )
                                            .join(' · ') || 'Sin cuotas acreditadas'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <PaymentStatusBadge status={payment.status} />

                                    {payment.receiptUrl && (
                                        <button
                                            type="button"
                                            disabled={openingId === payment.id}
                                            onClick={() =>
                                                void openReceipt(
                                                    payment.id,
                                                    payment.receiptUrl,
                                                )
                                            }
                                            className="inline-flex cursor-pointer items-center gap-1 text-sm text-brand hover:underline disabled:opacity-50"
                                        >
                                            {openingId === payment.id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <FileText className="size-4" />
                                            )}
                                            Comprobante
                                        </button>
                                    )}

                                    {payment.receipt && (
                                        <Link
                                            to={`/admin/verificar-recibo/${payment.receipt.verificationCode}`}
                                            className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                                        >
                                            <ReceiptText className="size-4" />
                                            Recibo N° {payment.receipt.number}
                                            {/* En gris y no en ámbar: la palabra ya
                                                dice el estado, y el ámbar como
                                                texto no llega al contraste. */}
                                            {payment.receipt.status === 'voided' && (
                                                <span className="text-muted-foreground">(anulado)</span>
                                            )}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.meta.totalItems > payments.length && (
                <p className="mt-4 text-xs text-muted-foreground">
                    Se muestran los {LIMIT} más recientes de {data.meta.totalItems}.
                </p>
            )}
        </section>
    )
}
