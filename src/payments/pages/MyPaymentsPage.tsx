import { Link } from 'react-router'
import {
    CalendarClock,
    CircleCheck,
    Clock,
    FileText,
    Loader2,
    ReceiptText,
    TriangleAlert,
} from 'lucide-react'

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

    /*
     * El pago que está trabando el próximo período, si es uno propio.
     *
     * `next-due` devuelve su id pero no qué es, y la diferencia cambia el
     * cartel: una transferencia esperando revisión se resuelve sola cuando
     * tesorería la mire; un checkout de Mercado Pago abandonado no se resuelve
     * nunca solo. Lo único que los separa es `checkoutUrl`, que viaja justo
     * mientras el pago sigue pendiente.
     *
     * Puede no encontrarse —el pendiente podría ser de un pago que hizo otro
     * tutor por la misma persona—, y ahí vale el cartel de siempre.
     */
    const blockingPayment = payments.find((payment) => payment.id === nextDue?.pendingPaymentId)

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
            {/*
             * Estar marcado como moroso NO siempre bloquea, y confundir las dos
             * cosas es el error caro: §5.8 exime del bloqueo al socio con
             * personas a cargo, justamente para que la deuda del adulto no deje
             * a un chico afuera de la cancha. El backend aplica esa excepción en
             * los dos lugares donde se decide si alguien puede pagar, así que el
             * cartel se arma con `canPay` y no con la marca — decirle "no podés
             * pagar" a quien sí puede es la peor combinación posible: el que se
             * rinde en la pantalla nunca descubre que podía.
             */}
            {nextDue?.delinquentSince && !nextDue.canPay && (
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

            {nextDue?.delinquentSince && nextDue.canPay && (
                <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Figurás como moroso desde{' '}
                        <strong className="text-foreground">
                            {formatCalendarDate(nextDue.delinquentSince)}
                        </strong>
                        . Podés seguir pagando desde acá —tuyo y de los chicos que tenés a
                        cargo—, pero tu credencial está vencida y en la puerta no entra hasta
                        que te pongas al día.
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

            {/*
             * Un checkout de Mercado Pago abandonado también deja un pago
             * PENDIENTE, y el backend no distingue: `next-due` devuelve
             * `canPay: false` igual que con una transferencia esperando
             * revisión.
             *
             * Pero no son lo mismo, y el cartel de "esperá a que el club lo
             * valide" es directamente falso acá: no hay ningún comprobante que
             * mirar y nadie del club va a resolver nada. El pago se destraba
             * cuando la persona termina de pagar —el link sigue siendo el
             * mismo— o cuando el proveedor avisa. Sin esto, el socio queda en un
             * callejón: no puede pagar por transferencia (el backend responde
             * 409 por el solapamiento) y la pantalla le dice que espere.
             */}
            {blockingPayment?.checkoutUrl ? (
                <div className="flex flex-wrap items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
                    <Clock className="mt-0.5 size-5 shrink-0 text-warning" />
                    <p className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground">
                        Tenés un pago de Mercado Pago sin terminar
                        {nextDue?.month && (
                            <>
                                {' '}
                                por la cuota de{' '}
                                <strong className="text-foreground">
                                    {formatMonth(nextDue.month)}
                                </strong>
                            </>
                        )}
                        . Hasta que lo completes no podés cargar otro pago por lo mismo.
                    </p>
                    {/* Es el MISMO link, no uno nuevo: el backend devuelve el
                        checkout que quedó abierto en vez de crear otro. */}
                    <Button asChild variant="hero" size="sm">
                        <a href={blockingPayment.checkoutUrl}>Retomar el pago</a>
                    </Button>
                </div>
            ) : (
                nextDue?.canPay === false &&
                !nextDue.delinquentSince &&
                nextDue.pendingPaymentId && (
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
                )
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
                                {/* El medio dejó de deducirse de la forma del
                                    registro: un pago de Mercado Pago tampoco
                                    tiene comprobante, así que sin esta columna
                                    era indistinguible de un cobro de mostrador. */}
                                <TableHead>Medio</TableHead>
                                <TableHead>Estado</TableHead>
                                {/* Dos columnas y no una, porque son dos cosas
                                    distintas: el comprobante es la foto de la
                                    transferencia que subió el socio; el recibo es
                                    lo que el club emitió al acreditarla. */}
                                <TableHead>Comprobante</TableHead>
                                <TableHead>Recibo</TableHead>
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
                                    {/* `methodLabel` y no una tabla propia: el
                                        nombre del medio lo escribe el servidor
                                        para que diga lo mismo acá, en el recibo
                                        y en la validación del QR. */}
                                    <TableCell className="text-muted-foreground">
                                        {payment.methodLabel}
                                    </TableCell>
                                    <TableCell>
                                        <PaymentStatusBadge status={payment.status} />
                                        {payment.status === PaymentStatuses.REJECTED &&
                                            payment.rejectionReason && (
                                                <p className="mt-1 text-xs text-destructive">
                                                    {payment.rejectionReason}
                                                </p>
                                            )}
                                        {/* Revertido no es rechazado: este se
                                            acreditó y después la plata volvió.
                                            Va el motivo y, además, la
                                            consecuencia: "contracargo del 12/08"
                                            explica qué pasó pero no que la cuota
                                            dejó de estar cubierta, que es lo que
                                            el socio tiene que hacer algo al
                                            respecto. */}
                                        {payment.status === PaymentStatuses.REVERTED && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {payment.revertReason ?? 'La plata volvió.'} La
                                                cuota quedó sin cubrir.
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
                                    {/* `receipt` viaja en el listado justamente
                                        para poder poner este botón sin una
                                        consulta por fila. */}
                                    <TableCell>
                                        {payment.receipt ? (
                                            <Button asChild variant="ghost" size="sm">
                                                <Link to={`/recibos/${payment.id}`}>
                                                    <ReceiptText />
                                                    N° {payment.receipt.number}
                                                    {payment.receipt.status === 'voided' && (
                                                        <span className="text-destructive">
                                                            (anulado)
                                                        </span>
                                                    )}
                                                </Link>
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
