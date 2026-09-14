import { Link, useParams } from 'react-router'
import { ArrowLeft, Download, Loader2, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { useReceiptDocument } from '../hooks/useMyPayments'
import { receiptPdfFileName, receiptPdfUrl } from '../lib/receipt-pdf'
import { ReceiptDocument } from '../components/ReceiptDocument'

/**
 * El recibo del club, en pantalla (§5.10).
 *
 * > El recibo es una pantalla de la app antes que un PDF. Se muestra, se imprime
 * > desde el navegador y se comparte por su enlace de verificación.
 *
 * Va fuera del layout del portal a propósito: así lo que se imprime es el recibo
 * y no el recibo con un sidebar al costado.
 */
export const ReceiptPage = () => {
    const { paymentId } = useParams()
    const { data: receipt, isLoading, isError } = useReceiptDocument(paymentId)
    const { download, openingId } = useOpenPrivateFile()

    return (
        <div className="min-h-dvh bg-background px-4 py-8">
            <div className="mx-auto mb-5 flex max-w-2xl flex-wrap items-center justify-between gap-3 print:hidden">
                <Button asChild variant="ghost" size="sm" className="-ml-2">
                    <Link to="/mi-cuenta/pagos">
                        <ArrowLeft /> Mis pagos
                    </Link>
                </Button>
                {receipt && paymentId && (
                    <div className="flex flex-wrap gap-2">
                        {/* El PDF lo arma el servidor: es el mismo papel que
                            manda por correo, con el mismo formato. Imprimir
                            desde el navegador sigue estando porque son dos
                            cosas distintas —una sale de la pantalla, la otra
                            del club— y §5.10 pide las dos.

                            Va también cuando el recibo está ANULADO: es un
                            recibo real que dejó de contar, sigue circulando
                            impreso y tiene que poder contestar qué le pasó. El
                            PDF sale con el sello y el motivo. */}
                        <Button
                            variant="outline"
                            disabled={openingId === paymentId}
                            onClick={() =>
                                void download(
                                    paymentId,
                                    receiptPdfUrl.forPayment(paymentId),
                                    receiptPdfFileName(receipt.number),
                                    { fromApiBase: true },
                                )
                            }
                        >
                            {openingId === paymentId ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Download />
                            )}
                            Bajar PDF
                        </Button>
                        <Button variant="dark" onClick={() => window.print()}>
                            <Printer /> Imprimir
                        </Button>
                    </div>
                )}
            </div>

            {isLoading && <Skeleton className="mx-auto h-96 max-w-2xl rounded-xl" />}

            {/*
             * El 404 tiene tres causas y ninguna es un error de la app: el pago
             * es de otra persona, no existe, o todavía no se aprobó —el recibo se
             * emite al aprobar—. La última es la única probable acá, así que es
             * la que se explica.
             */}
            {isError && (
                <p className="mx-auto max-w-2xl rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Todavía no hay recibo para este pago. El club lo emite cuando lo aprueba.
                </p>
            )}

            {receipt && <ReceiptDocument receipt={receipt} />}
        </div>
    )
}
