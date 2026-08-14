import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Info, Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { IMAGE_OR_PDF_TYPES, MAX_UPLOAD_SIZE } from '@/shared/lib/file-validation'
import { cn } from '@/lib/utils'
import { formatMoney, formatMonth } from '@/lib/format'
import { useCart, useCreateCartPayment } from '../hooks/useMyPayments'
import {
    PAYMENT_CONCEPT_LABELS,
    type CartPerson,
    type PayableConcept,
    type PaymentConcept,
} from '../interfaces/Payment'

const cartSchema = z.object({
    paymentDate: z.string().min(1, 'Ingresá la fecha del pago'),
    file: z
        .instanceof(File, { message: 'Adjuntá el comprobante' })
        .refine((file) => file.size <= MAX_UPLOAD_SIZE, 'El archivo no puede superar los 5MB')
        .refine(
            (file) => IMAGE_OR_PDF_TYPES.includes(file.type),
            'Solo se aceptan imágenes (JPG, PNG, WebP) o PDF',
        ),
})

type CartSchema = z.infer<typeof cartSchema>

/** Qué conceptos quedaron tildados por persona. */
type Selection = Record<string, PaymentConcept[]>

const isPicked = (selection: Selection, profileId: string, concept: PaymentConcept): boolean =>
    selection[profileId]?.includes(concept) ?? false

const togglePick = (
    selection: Selection,
    profileId: string,
    concept: PaymentConcept,
): Selection => {
    const current = selection[profileId] ?? []
    const next = current.includes(concept)
        ? current.filter((item) => item !== concept)
        : [...current, concept]

    // La persona sin nada tildado se saca del objeto: así el payload no lleva
    // entradas con `concepts: []`, que el backend rechaza con un 400.
    if (next.length === 0) {
        const rest = { ...selection }
        delete rest[profileId]
        return rest
    }

    return { ...selection, [profileId]: next }
}

/** Una fila tildable: el concepto, el mes y el precio (con descuento si hay). */
const PayableRow = ({
    item,
    checked,
    onToggle,
}: {
    item: PayableConcept
    checked: boolean
    onToggle: () => void
}) => (
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
            <span className="block text-xs text-muted-foreground">{formatMonth(item.month)}</span>
        </span>

        <span className="shrink-0 text-right">
            {/*
             * Con descuento se muestran los dos precios. El socio tiene que VER
             * el 50% del grupo familiar, no solo pagarlo: si solo apareciera el
             * importe final, el beneficio que el club decidió darle es
             * indistinguible de que la cuota valga eso.
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

/** Una persona del carrito: el titular o alguien a su cargo. */
const PersonBlock = ({
    person,
    selection,
    onToggle,
}: {
    person: CartPerson
    selection: Selection
    onToggle: (profileId: string, concept: PaymentConcept) => void
}) => (
    <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display font-bold text-ink">
                {person.isSelf ? `${person.name} (vos)` : person.name}
            </p>
            {person.memberNumber !== null && (
                <p className="kicker text-muted-foreground">Socio N° {person.memberNumber}</p>
            )}
        </div>

        {person.payable.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
                {person.payable.map((item) => (
                    <PayableRow
                        key={`${item.concept}-${item.month}`}
                        item={item}
                        checked={isPicked(selection, person.profileId, item.concept)}
                        onToggle={() => onToggle(person.profileId, item.concept)}
                    />
                ))}
            </div>
        )}

        {/*
         * Las notas son ACLARACIONES, no errores: explican por qué algo que uno
         * esperaría poder pagar no aparece en la lista. Por eso van en gris con
         * un ícono de información y no en rojo — el más común es "para pagar la
         * actividad tiene que tener la membresía al día", que no es una falla de
         * nadie sino el orden en que se paga.
         */}
        {person.notes.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
                {person.notes.map((note) => (
                    <p
                        key={note}
                        className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                        <Info className="mt-0.5 size-3.5 shrink-0" />
                        {note}
                    </p>
                ))}
            </div>
        )}

        {/* Sin nada para pagar y sin aclaraciones: está todo cubierto. El
            backend no manda ninguna nota en ese caso porque es el estado
            normal, así que si no se dijera nada la persona quedaría con un
            bloque vacío que parece un error. */}
        {person.payable.length === 0 && person.notes.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
                Está al día. No hay nada para pagarle este mes.
            </p>
        )}
    </div>
)

/**
 * Pagar por una o varias personas con un solo comprobante.
 *
 * Reemplaza al alta de a uno: el carrito incluye al propio titular, así que el
 * caso de siempre —el socio pagando su membresía— es este mismo con una sola
 * fila tildada.
 *
 * Del cliente salen SOLO la selección y el archivo. El total que se muestra acá
 * es informativo: el que vale lo calcula el servidor con los precios vigentes, y
 * el endpoint directamente no acepta un importe del navegador.
 */
export const PaymentCartDialog = () => {
    const [isOpen, setIsOpen] = useState(false)
    // La selección va en estado propio y no en el form: es un mapa de
    // persona → conceptos, que react-hook-form maneja peor que un useState, y
    // no tiene validación de campo que mostrar.
    const [selection, setSelection] = useState<Selection>({})

    const { data: people = [], isLoading } = useCart()
    const { mutate, isPending } = useCreateCartPayment()

    const form = useForm<CartSchema>({
        resolver: zodResolver(cartSchema),
        defaultValues: { paymentDate: new Date().toISOString().slice(0, 10) },
    })

    const selectedTotal = people.reduce((total, person) => {
        const picked = selection[person.profileId] ?? []
        return (
            total +
            person.payable
                .filter((item) => picked.includes(item.concept))
                .reduce((sum, item) => sum + item.amount, 0)
        )
    }, 0)

    const items = Object.entries(selection).map(([profileId, concepts]) => ({
        profileId,
        concepts,
    }))

    const hasAnythingToPay = people.some((person) => person.payable.length > 0)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            setSelection({})
            form.reset({ paymentDate: new Date().toISOString().slice(0, 10) })
        }
    }

    return (
        <>
            <Button variant="hero" onClick={() => handleOpenChange(true)}>
                <Upload /> Subir comprobante
            </Button>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogTitle className="font-display text-xl font-bold">
                        Pagar cuotas
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Elegí qué pagar de cada persona y subí un solo comprobante por el
                        total. El club revisa el pago y lo aprueba.
                    </DialogDescription>

                    {isLoading && <Skeleton className="mt-5 h-48 rounded-xl" />}

                    {!isLoading && people.length > 0 && (
                        <div className="mt-5 flex flex-col gap-3">
                            {people.map((person) => (
                                <PersonBlock
                                    key={person.profileId}
                                    person={person}
                                    selection={selection}
                                    onToggle={(profileId, concept) =>
                                        setSelection((current) =>
                                            togglePick(current, profileId, concept),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && !hasAnythingToPay && (
                        <p className="mt-5 rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                            No hay nada para pagar por ahora. Cuando arranque el mes que viene
                            vas a poder cargar el comprobante desde acá.
                        </p>
                    )}

                    {hasAnythingToPay && (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit((values) =>
                                    mutate(
                                        { ...values, items },
                                        {
                                            onSuccess: () => {
                                                setSelection({})
                                                form.reset()
                                                setIsOpen(false)
                                            },
                                        },
                                    ),
                                )}
                                className="mt-5 flex flex-col gap-5"
                            >
                                <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
                                    <span className="kicker text-accent-foreground/70">Total</span>
                                    <span className="font-display text-xl font-bold text-accent-foreground">
                                        {formatMoney(selectedTotal)}
                                    </span>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="paymentDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha del pago</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="file"
                                    // `field` trae value/onChange pensados para inputs de texto: un
                                    // <input type="file"> es no controlado, así que solo enganchamos onChange.
                                    render={({ field: { onChange, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>Comprobante</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                                    className="py-2"
                                                    onChange={(event) =>
                                                        onChange(event.target.files?.[0])
                                                    }
                                                    {...field}
                                                    value={undefined}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    variant="hero"
                                    disabled={isPending || items.length === 0}
                                >
                                    {isPending && <Loader2 className="animate-spin" />}
                                    {isPending ? 'Subiendo…' : 'Enviar comprobante'}
                                </Button>

                                {items.length === 0 && (
                                    <p className="-mt-2 text-center text-xs text-muted-foreground">
                                        Tildá al menos un concepto para continuar.
                                    </p>
                                )}
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
