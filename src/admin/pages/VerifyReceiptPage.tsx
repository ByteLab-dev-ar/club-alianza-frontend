import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Ban, Check, Download, Loader2, Search, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCalendarDate } from '@/lib/format'
import { ReceiptLines } from '@/payments/components/ReceiptLines'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { ReissueReceiptDialog } from '../components/ReissueReceiptDialog'
import { VoidReceiptDialog } from '../components/VoidReceiptDialog'
import { useOpenPrivateFile } from '@/lib/open-private-file'
import { receiptPdfFileName, receiptPdfUrl } from '@/payments/lib/receipt-pdf'
import { useVerifyReceipt } from '../hooks/useCounter'

/**
 * Verificar el código de un recibo (§5.10).
 *
 * A esta pantalla se llega escaneando el QR del papel. Exige sesión de personal
 * y no es pública: lo que revela es **quién lo emitió**, el nombre, el número de
 * socio y qué se pagó — y eso es justamente lo que lo hace servir de respaldo.
 * Cualquiera puede imprimir un papel; solo el club puede decir "este lo emitió
 * tal persona tal día".
 *
 * Las tres respuestas posibles se escriben distinto a propósito:
 *
 * - **válido**: el recibo cuenta.
 * - **anulado**: es un recibo REAL que dejó de contar. Nunca "inválido" — eso
 *   suena a falsificación, y la diferencia le importa a quien lo tiene en la
 *   mano.
 * - **404**: ese código no corresponde a ningún recibo del club. Es el único
 *   caso que merece la palabra *inválido*.
 *
 * Es también desde donde se anula, y no es una comodidad: `void` resuelve por
 * UUID, y esta respuesta es la única que lo tiene a mano. Quien pide la
 * anulación llega con el papel, y en el papel lo único que hay es el código.
 */
export const VerifyReceiptPage = () => {
    const { code } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [manualCode, setManualCode] = useState('')

    const { data: receipt, isLoading, isError } = useVerifyReceipt(code)
    const { download, openingId } = useOpenPrivateFile()

    /*
     * A esta pantalla se llega de dos maneras muy distintas, y el "volver"
     * tiene que respetarlas:
     *
     * - **Desde adentro del panel**, casi siempre desde el listado de pagos con
     *   un filtro puesto. Ahí lo correcto es el atrás del navegador, que
     *   restaura la pantalla anterior tal como estaba —incluido el filtro, que
     *   ahora vive en la URL—. Un link fijo a /admin/pagos la devolvería a
     *   "Pendientes, página 1" y habría que rehacer el camino.
     * - **Escaneando el QR del papel**, que abre esta URL de cero. Ahí no hay a
     *   dónde volver: un `-1` sacaría a la persona de la app.
     *
     * React Router marca la primera entrada del historial con `key: 'default'`,
     * y eso es lo que distingue un caso del otro.
     */
    const cameFromInsideTheApp = location.key !== 'default'

    return (
        <>
            {cameFromInsideTheApp ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 mb-4"
                    onClick={() => void navigate(-1)}
                >
                    <ArrowLeft /> Volver
                </Button>
            ) : (
                <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
                    <Link to="/admin/pagos">
                        <ArrowLeft /> Ir a Pagos
                    </Link>
                </Button>
            )}

            <AdminPageHeader
                kicker="Cobros"
                title="Verificar un recibo"
                description="Escaneá el código del papel, o pegá acá el código de verificación."
            />

            <form
                className="mb-6 flex flex-wrap gap-2"
                onSubmit={(event) => {
                    event.preventDefault()
                    const next = manualCode.trim()
                    if (next) void navigate(`/admin/verificar-recibo/${next}`)
                }}
            >
                <Input
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    placeholder="Código de verificación"
                    className="min-w-64 flex-1"
                />
                <Button type="submit" variant="dark">
                    <Search /> Verificar
                </Button>
            </form>

            {isLoading && code && <Skeleton className="h-64 rounded-xl" />}

            {isError && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center">
                    <XCircle className="mx-auto size-10 text-destructive" />
                    <p className="text-display mt-4 text-xl text-destructive">
                        Recibo inválido
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                        Ese código no corresponde a ningún recibo del club.
                    </p>
                </div>
            )}

            {receipt && (
                <div className="force-light rounded-xl border bg-card p-8 shadow-soft">
                    {receipt.status === 'valid' ? (
                        /* Igual que el bloque de "Recibo anulado" de abajo: el
                           color queda en el ícono y en el fondo, y el titular en
                           tinta. Son 18px en negrita, justo abajo del umbral de
                           "texto grande" de WCAG (18.66px), así que le siguen
                           pidiendo 4.5:1 y el verde da 3.55:1 sobre ese fondo.
                           Y este bloque vive dentro de `.force-light`, así que
                           se mide contra el blanco siempre, tema oscuro o no. */
                        <div className="flex items-center gap-3 rounded-lg bg-success/10 p-4">
                            <Check className="size-6 shrink-0 text-success" />
                            <div>
                                <p className="font-display text-lg font-bold text-ink">
                                    Recibo válido
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    N° {receipt.number} · emitido el{' '}
                                    {formatCalendarDate(receipt.issuedAt)}
                                    {receipt.issuedByName ? ` por ${receipt.issuedByName}` : ''}.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* ANULADO, no "inválido". Es un recibo real que dejó de
                           contar, y quien lo tiene en la mano necesita saber esa
                           diferencia — y de quién viene la decisión. */
                        <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-4">
                            <Ban className="mt-0.5 size-6 shrink-0 text-warning-strong" />
                            <div>
                                <p className="font-display text-lg font-bold text-ink">
                                    Recibo anulado
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    Es un recibo real que el club anuló
                                    {receipt.voidedAt
                                        ? ` el ${formatCalendarDate(receipt.voidedAt)}`
                                        : ''}
                                    {receipt.voidedByName ? `, ${receipt.voidedByName}` : ''}.
                                    {receipt.voidReason ? ` Motivo: ${receipt.voidReason}` : ''}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Si hubo una corrección, se emitió un recibo nuevo: este
                                    quedó sin efecto.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                            {/* Mismo `methodLabel` que muestra el recibo del
                                socio: el empleado que escanea y la persona que
                                tiene el papel tienen que leer lo mismo. */}
                            <p className="mt-1 font-semibold text-ink">{receipt.methodLabel}</p>
                        </div>
                    </div>

                    {/* El MISMO componente que dibuja el recibo del socio. Acá
                        había una segunda copia del detalle, y ya se había
                        separado: no mostraba el N° de socio de cada línea. Es el
                        mismo papel, mirado por el empleado en vez de por el
                        socio — no puede decir dos cosas distintas. */}
                    <div className="mt-6 border-t pt-6">
                        <ReceiptLines lines={receipt.detail} total={receipt.total} />
                    </div>

                    {/*
                     * El papel. Es lo que quien está en el mostrador vino a
                     * buscar, así que va primero y separado de todo lo demás.
                     *
                     * Este botón es el que hace falta de verdad: el socio recibe
                     * su PDF por correo, pero quien paga en efectivo puede no
                     * tener cuenta ni casilla, y entonces esta es la única forma
                     * de que se vaya con el papel.
                     *
                     * **Va también con el recibo ANULADO**, que es el motivo de
                     * que esté fuera del bloque de abajo. Estaba adentro, y ahí
                     * hacía lo contrario de lo que su propio comentario decía: el
                     * PDF sale con el sello y el motivo, y alguien que llega al
                     * mostrador con un papel anulado en la mano necesita
                     * justamente ese PDF — que era el único que no podía bajar.
                     */}
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                            <span className="font-semibold text-ink">
                                El recibo del club, para imprimir o mandar.
                            </span>{' '}
                            Sale igual si está anulado: con el sello y el motivo.
                        </p>
                        <Button
                            variant="dark"
                            disabled={openingId === receipt.id}
                            onClick={() =>
                                void download(
                                    receipt.id,
                                    receiptPdfUrl.forReceipt(receipt.id),
                                    receiptPdfFileName(receipt.number),
                                    { fromApiBase: true },
                                )
                            }
                        >
                            {openingId === receipt.id ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <Download />
                            )}
                            Bajar PDF
                        </Button>
                    </div>

                    {/*
                     * Las dos correcciones, subordinadas y juntas.
                     *
                     * Solo sobre el recibo que todavía cuenta: las dos acciones
                     * sobre uno anulado responden 409, y ofrecer los botones
                     * igual sería prometer algo que no existe.
                     *
                     * **Un solo párrafo para las dos, y no uno cada una.** Acá
                     * había tres bloques de texto gris de 12px, uno por botón,
                     * que se leían como documentación pegada al costado. Quien
                     * duda entre corregir y anular necesita COMPARARLAS, y con un
                     * párrafo por acción tenía que leer dos bloques separados
                     * para hacerlo. La diferencia entera cabe en dos frases.
                     *
                     * Corregir primero y anular después, que no es un detalle de
                     * orden: corregir deja al socio con un comprobante y anular
                     * lo deja sin ninguno. El caso frecuente es el primero.
                     */}
                    {receipt.status === 'valid' && (
                        <div className="mt-8 border-t pt-6">
                            <p className="font-display text-sm font-bold text-ink">
                                ¿Hay algo mal en este recibo?
                            </p>
                            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                                <strong className="font-semibold text-ink">Corregirlo</strong>{' '}
                                emite uno nuevo y deja este anulado con el motivo.{' '}
                                <strong className="font-semibold text-ink">Anularlo</strong> no
                                lleva reemplazo: el socio queda sin comprobante vigente.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <ReissueReceiptDialog
                                    receiptId={receipt.id}
                                    receiptNumber={receipt.number}
                                    // Al recibo nuevo, para poder imprimirlo en
                                    // el acto: la persona está esperando el
                                    // papel.
                                    onReissued={(nuevoCodigo) =>
                                        void navigate(
                                            `/admin/verificar-recibo/${nuevoCodigo}`,
                                        )
                                    }
                                />
                                <VoidReceiptDialog
                                    receiptId={receipt.id}
                                    receiptNumber={receipt.number}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!code && !isLoading && (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    Escaneá el QR del recibo o pegá su código arriba.
                </p>
            )}

            {isLoading && !code && <Loader2 className="mx-auto animate-spin" />}
        </>
    )
}
