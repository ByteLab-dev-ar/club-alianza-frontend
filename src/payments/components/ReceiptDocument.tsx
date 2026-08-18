import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

import { ClubLogo } from '@/components/custom/ClubLogo'
import { formatCalendarDate, formatMoney, formatPaymentMonth } from '@/lib/format'
import { paymentConceptLabel } from '@/payments/interfaces/Payment'
import type { Receipt } from '../interfaces/Receipt'

/**
 * La URL que se escanea desde el QR del recibo.
 *
 * Lleva al validador del club, que **exige sesión de personal**: lo que la
 * verificación revela es quién lo emitió, y eso es lo que lo hace servir de
 * respaldo — cualquiera puede imprimir un papel, pero solo el club puede decir
 * "este recibo lo emitió tal persona tal día".
 */
const buildReceiptVerificationUrl = (verificationCode: string) =>
    `${window.location.origin}/admin/verificar-recibo/${verificationCode}`

/**
 * El recibo del club, como se imprime (§5.10).
 *
 * **Nada de acá se recalcula**: el total, los precios de lista y los descuentos
 * vienen congelados como se emitieron. El papel que la persona tiene en la mano
 * y esta pantalla tienen que decir lo mismo dentro de diez años.
 */
export const ReceiptDocument = ({ receipt }: { receipt: Receipt }) => {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

    useEffect(() => {
        void QRCode.toDataURL(buildReceiptVerificationUrl(receipt.verificationCode), {
            margin: 1,
            width: 200,
            color: { dark: '#0b1220', light: '#ffffff' },
        }).then(setQrDataUrl)
    }, [receipt.verificationCode])

    const isVoided = receipt.status === 'voided'

    return (
        <article className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-8 shadow-soft print:border-0 print:shadow-none">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
                <div>
                    <ClubLogo />
                    <p className="mt-2 text-xs text-muted-foreground">Cutral Có, Neuquén</p>
                </div>
                <div className="text-right">
                    <p className="kicker text-muted-foreground">Recibo</p>
                    <p className="font-display text-2xl font-bold text-ink">
                        N° {receipt.number}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatCalendarDate(receipt.issuedAt)}
                    </p>
                </div>
            </header>

            {/*
             * ANULADO, nunca "inválido". Es un recibo real que dejó de contar, y
             * la diferencia le importa a quien lo tiene en la mano: "inválido"
             * suena a falsificación. Una corrección emite un recibo NUEVO — este
             * no se reescribe.
             */}
            {isVoided && (
                <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                    <p className="font-display text-lg font-bold text-destructive">
                        Recibo anulado
                    </p>
                    {/* Cuándo y QUIÉN: §5.10 pide las dos mitades. Con solo la
                        fecha y el motivo, quien tiene el papel lee la decisión
                        pero no de quién viene — y es el mismo recibo que el
                        empleado que lo escanea sí ve completo. */}
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        El club lo anuló
                        {receipt.voidedAt
                            ? ` el ${formatCalendarDate(receipt.voidedAt)}`
                            : ''}
                        {receipt.voidedByName ? `, ${receipt.voidedByName}` : ''}.
                        {receipt.voidReason ? ` Motivo: ${receipt.voidReason}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Si hubo una corrección, se emitió un recibo nuevo: este quedó sin
                        efecto.
                    </p>
                </div>
            )}

            <section className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="kicker text-muted-foreground">Recibimos de</p>
                    <p className="mt-1 font-semibold text-ink">{receipt.payerName}</p>
                    {receipt.payerMemberNumber !== null && (
                        <p className="text-xs text-muted-foreground">
                            Socio N° {receipt.payerMemberNumber}
                        </p>
                    )}
                </div>
                <div className="sm:text-right">
                    <p className="kicker text-muted-foreground">Forma de pago</p>
                    <p className="mt-1 font-semibold text-ink">
                        {receipt.paidInCash ? 'Efectivo en la sede' : 'Transferencia'}
                    </p>
                </div>
            </section>

            <section className="mt-6">
                <p className="kicker text-muted-foreground">Detalle</p>
                <ul className="mt-2 flex flex-col divide-y">
                    {receipt.detail.map((line, index) => (
                        <li
                            key={`${line.memberName}-${line.concept}-${line.month}-${index}`}
                            className="flex items-start justify-between gap-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">
                                    {line.memberName}
                                    {line.memberNumber !== null && (
                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            N° {line.memberNumber}
                                        </span>
                                    )}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {paymentConceptLabel(line.concept)} ·{' '}
                                    {formatPaymentMonth(line.month)}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                {/* El precio de lista tachado cuando hubo
                                    descuento: de eso vive la confianza en el
                                    número. Se compara contra `amount` y no se
                                    calcula nada — los dos vienen congelados. */}
                                {line.listAmount !== null && line.listAmount !== line.amount && (
                                    <span className="mr-2 text-xs text-muted-foreground line-through">
                                        {formatMoney(line.listAmount)}
                                    </span>
                                )}
                                <span className="text-sm font-bold text-ink">
                                    {formatMoney(line.amount)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="kicker text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-ink">
                    {formatMoney(receipt.total)}
                </span>
            </section>

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t pt-6">
                <div className="min-w-0">
                    <p className="kicker text-muted-foreground">Código de verificación</p>
                    {/* "Código de verificación", nunca "firma" del recibo: la ley
                        25.506 reserva ese término para el certificado de un
                        certificador licenciado. */}
                    <p className="mt-1 font-mono text-sm break-all text-ink">
                        {receipt.verificationCode}
                    </p>
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                        {receipt.issuedByName
                            ? `Emitido por ${receipt.issuedByName}. `
                            : ''}
                        El club puede verificarlo escaneando el código.
                    </p>
                </div>

                {qrDataUrl && (
                    <img
                        src={qrDataUrl}
                        alt="Código de verificación del recibo"
                        className="size-28 shrink-0 rounded-lg border bg-white p-1"
                    />
                )}
            </footer>
        </article>
    )
}
