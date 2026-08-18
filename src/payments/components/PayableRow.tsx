import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatMoney, formatMonth } from '@/lib/format'
import { PAYMENT_CONCEPT_LABELS, type PayableConcept } from '../interfaces/Payment'

/**
 * Una fila tildable: el concepto, el mes y el precio (con descuento si hay).
 *
 * La comparte el carrito del socio con el mostrador de tesorería, porque §5.10
 * dice que son la misma pantalla operada por dos roles. Lo que se muestra acá
 * no es decoración: el 50% familiar tachado es la única forma de que el
 * beneficio se distinga de que la cuota valga eso, y en el mostrador es además
 * el número que el tesorero dice en voz alta antes de recibir la plata.
 */
export const PayableRow = ({
    item,
    checked,
    onToggle,
}: {
    item: PayableConcept
    checked: boolean
    onToggle: () => void
}) => {
    const requiresLabels = item.requires.map((concept) => PAYMENT_CONCEPT_LABELS[concept])

    return (
        <label
            className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                checked ? 'border-brand bg-accent/40' : 'hover:bg-muted/50',
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="size-4 shrink-0 accent-[var(--brand)]"
            />

            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">
                    {PAYMENT_CONCEPT_LABELS[item.concept]}
                </span>
                <span className="block text-xs text-muted-foreground">
                    {formatMonth(item.month)}
                </span>
                {/* Se avisa que va acompañado, no que falta algo: tildarlo suma
                    solo lo que la cadena exige, así que no hay nada que
                    resolver. Sin este renglón, ver dos casillas marcarse de
                    golpe parece un error de la app. */}
                {requiresLabels.length > 0 && (
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        Se paga junto con {requiresLabels.join(' y ')}
                    </span>
                )}
            </span>

            <span className="shrink-0 text-right">
                {/*
                 * Con descuento se muestran los dos precios. El socio tiene que
                 * VER el 50% del grupo familiar, no solo pagarlo: si solo
                 * apareciera el importe final, el beneficio que el club decidió
                 * darle es indistinguible de que la cuota valga eso.
                 */}
                {item.hasFamilyDiscount && (
                    <span className="mr-2 text-xs text-muted-foreground line-through">
                        {formatMoney(item.listAmount)}
                    </span>
                )}
                <span className="text-sm font-bold text-ink">{formatMoney(item.amount)}</span>
                {item.hasFamilyDiscount && (
                    <span className="mt-0.5 block text-[11px] font-bold text-success">
                        50% familiar
                    </span>
                )}
            </span>
        </label>
    )
}

/**
 * Por qué NO se le puede cobrar algo que uno esperaría poder cobrarle.
 *
 * Son **aclaraciones, no errores**, y por eso van en gris con un ícono de
 * información y no en rojo: el caso más común —"para pagar la actividad tiene
 * que tener la membresía al día"— no es una falla de nadie sino el orden en que
 * se paga, y se destraba solo si se suma la membresía a la misma operación.
 */
export const PayableNotes = ({ notes }: { notes: string[] }) => (
    <div className="flex flex-col gap-1.5">
        {notes.map((note) => (
            <p
                key={note}
                className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
            >
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {note}
            </p>
        ))}
    </div>
)
