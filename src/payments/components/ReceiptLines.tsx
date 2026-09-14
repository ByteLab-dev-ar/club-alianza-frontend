import { formatMoney, formatPaymentMonth } from '@/lib/format'
import { paymentConceptLabel } from '../interfaces/Payment'

/**
 * Una línea del recibo, congelada como se emitió.
 *
 * Va tipada por su forma y no importando `ReceiptDetailLine` ni
 * `VerifiedReceiptLine`: son idénticas campo por campo —el mismo papel, visto
 * por el socio y por el mostrador— y atarse a una obligaría a la otra pantalla a
 * castear. Mismo criterio que `PayablePerson` en `payable-selection`.
 */
export interface ReceiptLine {
    memberName: string
    memberNumber: number | null
    /** Ya viene escrito como lo imprimió el club. No se re-traduce acá. */
    concept: string
    month: string
    /** El precio de lista. La diferencia contra `amount` es lo que se descontó. */
    listAmount: number | null
    amount: number
}

interface Props {
    lines: ReceiptLine[]
    total: number
}

/**
 * El detalle del recibo del club, con cada importe bajo un encabezado que dice
 * qué es.
 *
 * **Existe para que haya UNA sola versión.** Estaba escrito dos veces —en el
 * recibo del socio y adentro de la pantalla de verificación del mostrador— y ya
 * habían divergido: uno mostraba el N° de socio de cada línea y el otro no. Es
 * el mismo papel mirado por dos personas, y no puede decir dos cosas. Es el
 * mismo pozo del que salió `methodLabel`.
 *
 * Antes era una lista sin encabezados, y ahí ningún número decía qué era: un
 * "$ 9.000" tachado al lado de un "$ 4.500" se lee como precio de lista, como
 * descuento o como un error del club. Y la línea sin descuento no tenía la
 * misma forma que la que sí lo tenía, así que parecían dos cosas distintas.
 *
 * **Nada se recalcula.** `listAmount` y `amount` vienen congelados del servidor;
 * el descuento es la resta de esos dos, que es lo que el propio contrato dice
 * que significa ("la diferencia contra `amount` es lo que se descontó").
 */
export const ReceiptLines = ({ lines, total }: Props) => {
    return (
        <>
            <p className="kicker text-muted-foreground">Detalle</p>

            {/* Red por si un nombre muy largo empuja la tabla igual: ahí scrollea
                ella, nunca la hoja. */}
            <div className="mt-2 overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        {/*
                         * En un teléfono no entran cuatro columnas de importes
                         * —medido: sobran 75px— y un recibo que hay que mover de
                         * costado para leer no se lee. Abajo de `sm` las dos del
                         * medio se caen y su dato aparece como texto bajo el
                         * detalle: lo que hacían los encabezados lo hacen las
                         * palabras, y no se pierde ningún número.
                         */}
                        <tr className="border-b">
                            {/* "Socio" y no "Detalle": la sección de arriba ya se
                                llama así, y repetir la palabra en la columna
                                dejaba el mismo rótulo dos veces, uno debajo del
                                otro. Además es más preciso — cada línea ES una
                                persona, con su número, y el concepto y el mes van
                                abajo del nombre. Misma palabra que usa la tabla
                                de pagos del panel. */}
                            <th className="pb-2 text-left font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Socio
                            </th>
                            <th className="hidden pb-2 pl-4 text-right font-display text-xs font-bold tracking-wider text-muted-foreground uppercase sm:table-cell">
                                Precio de lista
                            </th>
                            <th className="hidden pb-2 pl-4 text-right font-display text-xs font-bold tracking-wider text-muted-foreground uppercase sm:table-cell">
                                Descuento
                            </th>
                            <th className="pb-2 pl-4 text-right font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Importe
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {lines.map((line, index) => {
                            // El descuento primero y `hasDiscount` derivado de
                            // él, no al revés: así no hace falta un `!` sobre
                            // `listAmount` que se quedaría mintiendo si alguien
                            // toca la condición.
                            const discount =
                                line.listAmount !== null && line.listAmount !== line.amount
                                    ? line.listAmount - line.amount
                                    : null
                            const hasDiscount = discount !== null

                            return (
                                <tr
                                    key={`${line.memberName}-${line.concept}-${line.month}-${index}`}
                                    className="border-b last:border-0"
                                >
                                    <td className="py-3 text-left align-top">
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
                                        {/* Lo mismo que dicen las dos columnas
                                            que se caen en pantalla angosta. */}
                                        <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                                            {line.listAmount === null
                                                ? 'Sin precio de lista registrado'
                                                : discount === null
                                                  ? `Lista ${formatMoney(line.listAmount)} · sin descuento`
                                                  : `Lista ${formatMoney(line.listAmount)} · descuento ${formatMoney(discount)}`}
                                        </p>
                                    </td>

                                    {/* Tachado SOLO cuando hubo descuento: donde
                                        no lo hubo es el mismo número que el
                                        importe, y tacharlo diría que se cobró
                                        otra cosa. Y `null` no se disimula como
                                        "sin descuento": es un recibo emitido
                                        antes de que existiera el precio de
                                        lista, y decir "—" es lo honesto. */}
                                    <td
                                        className={`hidden py-3 pl-4 text-right align-top text-sm whitespace-nowrap text-muted-foreground sm:table-cell ${hasDiscount ? 'line-through' : ''}`}
                                    >
                                        {line.listAmount === null
                                            ? '—'
                                            : formatMoney(line.listAmount)}
                                    </td>
                                    <td className="hidden py-3 pl-4 text-right align-top text-sm whitespace-nowrap sm:table-cell">
                                        {discount === null ? (
                                            <span className="text-muted-foreground">—</span>
                                        ) : (
                                            <span className="font-semibold text-success">
                                                −{formatMoney(discount)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 pl-4 text-right align-top text-sm font-bold whitespace-nowrap text-ink">
                                        {formatMoney(line.amount)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>

                    <tfoot>
                        <tr>
                            <td className="pt-4 text-left">
                                <span className="kicker text-muted-foreground">Total</span>
                            </td>
                            <td className="hidden sm:table-cell" />
                            <td className="hidden sm:table-cell" />
                            <td className="pt-4 pl-4 text-right font-display text-2xl font-bold whitespace-nowrap text-ink">
                                {formatMoney(total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    )
}
