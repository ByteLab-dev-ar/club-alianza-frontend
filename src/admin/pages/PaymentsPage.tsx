import { Link, useSearchParams } from 'react-router'
import { Check, FileText, Loader2, ReceiptText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCalendarDate, formatMoney, formatPaymentMonth } from '@/lib/format'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { FilterTabs } from '@/components/custom/FilterTabs'
import { Pagination } from '@/components/custom/Pagination'
import { PaymentStatusBadge } from '@/payments/components/PaymentStatusBadge'
import {
    PaymentMethods,
    PaymentStatuses,
    summarizeConcepts,
    summarizeMonths,
} from '@/payments/interfaces/Payment'
import { useAuthStore } from '@/auth/store/auth.store'
import { Roles } from '@/constants/roles'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { RejectPaymentDialog } from '../components/RejectPaymentDialog'
import { RevertPaymentDialog } from '../components/RevertPaymentDialog'
import { useAdminPayments, useApprovePayment } from '../hooks/useAdminPayments'
import {
    DEFAULT_PAYMENTS_TAB,
    PAYMENTS_TABS,
    parsePaymentsTab,
    type PaymentsTabValue,
} from '../lib/payments-tabs'
import type { AdminPayment } from '../interfaces/AdminPayment'

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
     *
     * Lo que viaja en `?estado=` es el NOMBRE de la solapa, que ya no es lo
     * mismo que un status: "Pendientes" es PENDING pero solo de transferencias.
     * Cada solapa declara qué pide en
     * `PAYMENTS_TABS`, y los valores de siempre no cambiaron, así que los links
     * viejos siguen abriendo donde abrían.
     */
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = parsePaymentsTab(searchParams.get('estado'))
    const page = parsePage(searchParams.get('pagina'))

    const updateParams = (next: { estado?: PaymentsTabValue; pagina?: number }) => {
        const params = new URLSearchParams(searchParams)
        const estado = next.estado ?? tab.value
        const pagina = next.pagina ?? 1

        // Los valores por defecto no se escriben: `/admin/pagos` a secas tiene
        // que seguir significando "pendientes, página 1".
        if (estado === DEFAULT_PAYMENTS_TAB.value) params.delete('estado')
        else params.set('estado', estado)

        if (pagina === 1) params.delete('pagina')
        else params.set('pagina', String(pagina))

        // `replace` para que cambiar de pestaña no apile una entrada por click:
        // el atrás tiene que volver a la pantalla anterior, no recorrer los
        // filtros que se fueron probando.
        setSearchParams(params, { replace: true })
    }

    const { data, isLoading, isError, isPlaceholderData } = useAdminPayments({
        page,
        limit: PAGE_SIZE,
        ...tab.query,
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
            <AdminPageHeader
                kicker="Gestión"
                title="Pagos"
                filters={
                    <FilterTabs
                        options={PAYMENTS_TABS}
                        value={tab.value}
                        // Al cambiar de pestaña la página vuelve a 1: la anterior
                        // deja de tener sentido porque el filtro nuevo tiene su
                        // propio total. Es el default de `updateParams`.
                        onChange={(estado) => updateParams({ estado })}
                    />
                }
            />

            <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
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
                    // El vacío lo escribe cada solapa: con un texto genérico,
                    // "Pendientes" vacío —que es la buena noticia, la bandeja
                    // al día— se leía igual que cualquier categoría sin filas.
                    <p className="p-12 text-center text-sm text-muted-foreground">
                        {tab.emptyMessage}
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/*
                                 * Siete columnas y no diez. Ningún dato se fue:
                                 * se apilaron los pares que contestan la misma
                                 * pregunta, igual que "Socio" ya hacía con el
                                 * nombre y el número.
                                 *
                                 * Con diez, la tabla pedía 1243px y en el ancho
                                 * del panel había 1150: scrolleaba de costado en
                                 * cualquier pantalla que no fuera enorme, y en un
                                 * notebook de 1440 tampoco entraba. Con siete
                                 * pide 1072.
                                 */}
                                <TableHead>Socio</TableHead>
                                {/* Concepto y mes son "qué cuota es". Aprobar
                                    extiende UNA de las tres coberturas, así que
                                    el concepto no es decorativo: sin él, dos
                                    filas del mismo socio y el mismo mes se ven
                                    idénticas. */}
                                <TableHead>Cuota</TableHead>
                                <TableHead>Fecha</TableHead>
                                {/* Monto y medio son "cuánta plata y por dónde".
                                    Conciliando, sin el medio un pago de Mercado
                                    Pago y un cobro de mostrador se ven igual: los
                                    dos sin comprobante y ya resueltos. */}
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                {/* Los dos papeles, que NO son lo mismo: el
                                    comprobante es la foto que subió quien pagó y
                                    el recibo es lo que emitió el club. Comparten
                                    columna porque nunca hay más de dos y son la
                                    misma pregunta —"¿qué papel hay?"—, no porque
                                    den igual. */}
                                <TableHead>Papeles</TableHead>
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
                                        por persona vive en el pago.

                                        Un pago SIN líneas —los que no son de
                                        cuota— dice "Sin período" y no "Cuota",
                                        que es la caída de `formatPaymentMonth` y
                                        acá quedaba puesta debajo de un rótulo
                                        que ya dice "Cuota". */}
                                    <TableCell>
                                        <p className="font-medium text-ink">
                                            {summarizeConcepts(payment) ?? '—'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {summarizeMonths(payment)
                                                ? formatPaymentMonth(summarizeMonths(payment))
                                                : 'Sin período'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatCalendarDate(payment.paymentDate)}
                                    </TableCell>
                                    {/* `methodLabel` viene armado del servidor:
                                        es el mismo texto que sale en el recibo
                                        del socio y en la validación del QR. */}
                                    <TableCell>
                                        <p className="font-semibold text-ink">
                                            {formatMoney(payment.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.methodLabel}
                                        </p>
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
                                                <p className="mt-1 max-w-64 whitespace-normal text-xs text-destructive">
                                                    {payment.revertReason}
                                                </p>
                                            )}
                                        {/* El importe ajustado del mostrador. Acá
                                            importa tanto como al socio: explica
                                            por qué la fila no dice el precio de
                                            lista. */}
                                        {payment.amountReason && (
                                            <p className="mt-1 max-w-64 whitespace-normal text-xs text-muted-foreground">
                                                {payment.amountReason}
                                            </p>
                                        )}
                                    </TableCell>
                                    {/* Los dos papeles en una celda, y siguen
                                        siendo dos cosas distintas: el
                                        COMPROBANTE es la foto de la
                                        transferencia que subió quien pagó, y el
                                        RECIBO es lo que emitió el club — el que
                                        le van a pedir en el mostrador. Por eso
                                        cada uno conserva su ícono y su palabra,
                                        en vez de quedar como "dos links".

                                        El recibo va al verificador y no a una
                                        pantalla nueva porque ahí ya está todo:
                                        el detalle congelado, quién lo emitió, y
                                        las acciones de corregir y anular. */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
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
                                                    className="inline-flex items-center gap-1 text-sm text-brand hover:underline disabled:opacity-50"
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
                                                    N° {payment.receipt.number}
                                                    {payment.receipt.status === 'voided' && (
                                                        <span className="text-warning">
                                                            (anulado)
                                                        </span>
                                                    )}
                                                </Link>
                                            )}

                                            {!payment.receiptUrl && !payment.receipt && (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/*
                                         * Un pago de Mercado Pago pendiente NO se
                                         * aprueba ni se rechaza a mano, y el
                                         * backend lo rechaza con 409.
                                         *
                                         * Que esté pendiente significa que **la
                                         * plata no entró**: el socio abandonó el
                                         * checkout, o el aviso del proveedor
                                         * todavía no llegó. Aprobarlo acreditaría
                                         * cobertura y emitiría un recibo por plata
                                         * que el club nunca recibió.
                                         *
                                         * Pero la fila se sigue mostrando: que un
                                         * socio tenga un checkout sin terminar es
                                         * justo lo que explica el "pero yo ya
                                         * pagué" del mostrador.
                                         *
                                         * Si alguien tiene la pantalla abierta de
                                         * antes y el botón viejo pega igual, el
                                         * 409 se muestra tal cual: viene escrito
                                         * para que lo lea tesorería, y
                                         * `getApiErrorMessage` usa el mensaje del
                                         * servidor.
                                         */}
                                        {payment.status === PaymentStatuses.PENDING &&
                                        payment.method === PaymentMethods.MERCADO_PAGO ? (
                                            <span className="text-xs text-muted-foreground">
                                                Lo confirma Mercado Pago
                                            </span>
                                        ) : payment.status === PaymentStatuses.PENDING ? (
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
                                                {/* Acotado y con el título completo
                                                    al pasar el mouse: cuando quien
                                                    validó no tiene nombre cargado
                                                    sale su mail entero, y "por
                                                    bytelabs.ar@gmail.com" se llevaba
                                                    ~180px de ancho de tabla en una
                                                    celda que es un dato de apoyo. */}
                                                <span
                                                    className="max-w-32 truncate text-xs text-muted-foreground"
                                                    title={
                                                        payment.validatedBy
                                                            ? (payment.validatedBy.name ??
                                                              payment.validatedBy.email)
                                                            : undefined
                                                    }
                                                >
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
