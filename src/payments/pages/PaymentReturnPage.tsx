import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CircleCheck, CircleX, Loader2, ReceiptText, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatMoney, formatPaymentMonth } from '@/lib/format'
import { useMercadoPagoReturn } from '../hooks/useMyPayments'
import {
    PaymentStatuses,
    summarizeConcepts,
    summarizeMonths,
    type Payment,
} from '../interfaces/Payment'

/** Qué cubría el pago, en una línea. */
const Covered = ({ payment }: { payment: Payment }) => {
    const concepts = summarizeConcepts(payment)
    const months = summarizeMonths(payment)

    if (!concepts && !months) return null

    return (
        <p className="mt-1 text-sm text-muted-foreground">
            {[concepts, months && formatPaymentMonth(months)].filter(Boolean).join(' · ')}
        </p>
    )
}

const Shell = ({
    icon,
    title,
    children,
}: {
    icon: ReactNode
    title: string
    children: ReactNode
}) => (
    <main className="grid min-h-screen place-items-center bg-tertiary px-5 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
            <div className="grid place-items-center">{icon}</div>
            <h1 className="text-display mt-5 text-2xl text-ink">{title}</h1>
            {children}
        </div>
    </main>
)

const BackToPayments = ({ label = 'Ir a mis pagos' }: { label?: string }) => (
    <Button asChild variant="outline" className="mt-6 w-full">
        <Link to="/mi-cuenta/pagos">{label}</Link>
    </Button>
)

/**
 * A dónde vuelve la persona después de pagar por Mercado Pago.
 *
 * Vive en `/pagos` y no bajo `/mi-cuenta` porque es la URL de retorno que arma
 * el backend (`MP_RETURN_URL`, que por defecto es `${FRONTEND_URL}/pagos`). Sin
 * esta ruta, el socio terminaba de pagar y caía en un 404 — justo el momento en
 * el que menos hay que dejarlo solo.
 *
 * **No lee NADA de los parámetros de la URL.** Mercado Pago vuelve con `status`,
 * `collection_status` y `payment_id` colgando de la query, y eso lo controla el
 * navegador: alcanza con escribirla a mano para darse por aprobado. El estado
 * sale de preguntarle al backend, que se entera por el aviso del proveedor.
 *
 * Es una pantalla de paso: informa y manda al historial, que es donde vive la
 * información de verdad.
 */
export const PaymentReturnPage = () => {
    const { payment, isLoading, isError, gaveUpWaiting } = useMercadoPagoReturn()

    if (isLoading) {
        return (
            <Shell
                icon={<Loader2 className="size-10 animate-spin text-brand" />}
                title="Estamos confirmando tu pago"
            >
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Puede tardar unos segundos. No cierres esta pantalla.
                </p>
            </Shell>
        )
    }

    if (isError) {
        return (
            <Shell
                icon={<TriangleAlert className="size-10 text-warning" />}
                title="No pudimos consultar tu pago"
            >
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    El pago puede haber salido bien igual: esto es solo que no pudimos
                    preguntarle al club. Revisá tu historial en un rato.
                </p>
                <BackToPayments />
            </Shell>
        )
    }

    // Sin ningún pago por este medio: alguien entró a la URL de retorno sin
    // haber pagado, o volvió mucho después. No es un error.
    if (!payment) {
        return (
            <Shell
                icon={<ReceiptText className="size-10 text-muted-foreground" />}
                title="No encontramos un pago reciente"
            >
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    No hay ningún pago de Mercado Pago para mostrarte acá. Si acabás de
                    pagar, revisá tu historial.
                </p>
                <BackToPayments />
            </Shell>
        )
    }

    if (payment.status === PaymentStatuses.APPROVED) {
        return (
            <Shell icon={<CircleCheck className="size-10 text-success" />} title="Pago acreditado">
                <p className="mt-2 font-display text-2xl font-bold text-ink">
                    {formatMoney(payment.amount)}
                </p>
                <Covered payment={payment} />

                {/* El recibo del club sale para los tres medios: el comprobante
                    de Mercado Pago es de ellos, y este es el que vale. */}
                {payment.receipt && (
                    <Button asChild variant="hero" className="mt-6 w-full">
                        <Link to={`/recibos/${payment.id}`}>
                            <ReceiptText />
                            Ver recibo N° {payment.receipt.number}
                        </Link>
                    </Button>
                )}

                <BackToPayments />
            </Shell>
        )
    }

    if (payment.status === PaymentStatuses.REJECTED) {
        return (
            <Shell icon={<CircleX className="size-10 text-destructive" />} title="El pago no se completó">
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {payment.rejectionReason ??
                        'Mercado Pago no lo aprobó, así que no se te cobró nada. Podés volver a intentarlo desde tus pagos.'}
                </p>
                <BackToPayments label="Volver a intentar" />
            </Shell>
        )
    }

    if (payment.status === PaymentStatuses.REVERTED) {
        return (
            <Shell
                icon={<TriangleAlert className="size-10 text-destructive" />}
                title="Este pago se dio de baja"
            >
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {payment.revertReason ?? 'La plata volvió.'} La cuota quedó sin cubrir.
                    {/* Mandar a la sede solo cuando no hay motivo: con el motivo
                        a la vista, ya sabe por qué y el viaje sobra. */}
                    {!payment.revertReason && ' Si no sabés por qué, consultá en la sede.'}
                </p>
                <BackToPayments />
            </Shell>
        )
    }

    // Pendiente. El aviso del proveedor llega por su lado, así que esto es
    // normal y NO un error: se dice que se está confirmando y se manda al
    // historial, que es donde va a aparecer resuelto.
    return (
        <Shell
            icon={
                gaveUpWaiting ? (
                    <ReceiptText className="size-10 text-warning" />
                ) : (
                    <Loader2 className="size-10 animate-spin text-brand" />
                )
            }
            title="Estamos confirmando tu pago"
        >
            <p className="mt-2 font-display text-2xl font-bold text-ink">
                {formatMoney(payment.amount)}
            </p>
            <Covered payment={payment} />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {gaveUpWaiting
                    ? 'Mercado Pago todavía no nos avisó. Puede tardar unos minutos: cuando se acredite lo vas a ver en tu historial, y el club te emite el recibo.'
                    : 'Puede tardar unos segundos. No cierres esta pantalla.'}
            </p>
            <BackToPayments />
        </Shell>
    )
}
