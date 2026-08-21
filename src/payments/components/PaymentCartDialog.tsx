import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { IMAGE_OR_PDF_TYPES, MAX_UPLOAD_SIZE } from '@/shared/lib/file-validation'
import { formatMoney } from '@/lib/format'
import { useCart, useCreateCartPayment } from '../hooks/useMyPayments'
import {
    isPicked,
    selectedTotal,
    togglePick,
    type PayableSelection,
} from '../lib/payable-selection'
import { PayableNotes, PayableRow } from './PayableRow'
import {
    PaymentMethods,
    type CartPerson,
    type CreateCartPaymentPayload,
    type PaymentConcept,
} from '../interfaces/Payment'

/**
 * El comprobante lo pide UN solo medio, así que la validación es condicional.
 *
 * Va con `superRefine` sobre un objeto plano y no con `z.discriminatedUnion`
 * porque react-hook-form registra campos por nombre: con la unión, `file` deja
 * de existir en una de las ramas y el `FormField` que lo dibuja se queda sin
 * tipo. El objeto plano mantiene el formulario simple y la regla vive en un
 * solo lugar.
 */
const cartSchema = z
    .object({
        method: z.enum([PaymentMethods.TRANSFER, PaymentMethods.MERCADO_PAGO]),
        paymentDate: z.string().min(1, 'Ingresá la fecha del pago'),
        file: z.instanceof(File).optional(),
    })
    .superRefine((values, ctx) => {
        // Con Mercado Pago no hay nada que adjuntar: el comprobante lo emite
        // ellos y el que vale para el socio es el recibo del club.
        if (values.method !== PaymentMethods.TRANSFER) return

        if (!values.file) {
            ctx.addIssue({ code: 'custom', path: ['file'], message: 'Adjuntá el comprobante' })
            return
        }

        if (values.file.size > MAX_UPLOAD_SIZE) {
            ctx.addIssue({
                code: 'custom',
                path: ['file'],
                message: 'El archivo no puede superar los 5MB',
            })
        }

        if (!IMAGE_OR_PDF_TYPES.includes(values.file.type)) {
            ctx.addIssue({
                code: 'custom',
                path: ['file'],
                message: 'Solo se aceptan imágenes (JPG, PNG, WebP) o PDF',
            })
        }
    })

type CartSchema = z.infer<typeof cartSchema>

/** Los dos medios que se eligen desde la app. El efectivo se cobra en la sede. */
const METHOD_OPTIONS = [
    {
        value: PaymentMethods.TRANSFER,
        label: 'Transferencia',
        hint: 'Subís el comprobante y el club lo revisa. Se acredita cuando tesorería lo aprueba.',
    },
    {
        value: PaymentMethods.MERCADO_PAGO,
        label: 'Mercado Pago',
        hint: 'Te llevamos a pagar y volvés. No hay nada que subir ni que esperar a que revisen.',
    },
] as const

/*
 * La lógica de selección —arrastrar la cadena de §5.3 al tildar y al destildar—
 * y la fila con el precio viven en `lib/payable-selection.ts` y
 * `components/PayableRow.tsx`, no acá: §5.10 dice que el mostrador es "el mismo
 * carrito operado por tesorería", así que las dos pantallas comparten pieza en
 * vez de tener cada una su copia de la regla que evita el 422.
 */

/** Una persona del carrito: el titular o alguien a su cargo. */
const PersonBlock = ({
    person,
    selection,
    onToggle,
}: {
    person: CartPerson
    selection: PayableSelection
    onToggle: (person: CartPerson, concept: PaymentConcept) => void
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
                        onToggle={() => onToggle(person, item.concept)}
                    />
                ))}
            </div>
        )}

        {person.notes.length > 0 && (
            <div className="mt-3">
                <PayableNotes notes={person.notes} />
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
    const [selection, setSelection] = useState<PayableSelection>({})

    const { data: people = [], isLoading } = useCart()
    const { mutate, isPending } = useCreateCartPayment()

    const form = useForm<CartSchema>({
        resolver: zodResolver(cartSchema),
        defaultValues: {
            // Transferencia por defecto: es el medio que ya venía funcionando y
            // el default del backend. Mercado Pago se elige.
            method: PaymentMethods.TRANSFER,
            paymentDate: new Date().toISOString().slice(0, 10),
        },
    })

    // useWatch y no form.watch: misma lectura, pero `watch()` devuelve una
    // función que el compilador de React no puede memoizar, y con eso saltea el
    // componente entero (mismo criterio que EventFormDialog y StaffFormDialog).
    const method = useWatch({ control: form.control, name: 'method' })
    const isTransfer = method === PaymentMethods.TRANSFER

    const total = selectedTotal(people, selection)

    const items = Object.entries(selection).map(([profileId, concepts]) => ({
        profileId,
        concepts,
    }))

    const hasAnythingToPay = people.some((person) => person.payable.length > 0)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            setSelection({})
            form.reset({
                method: PaymentMethods.TRANSFER,
                paymentDate: new Date().toISOString().slice(0, 10),
            })
        }
    }

    /*
     * El payload sale como unión, no como objeto con `file` opcional: cada medio
     * manda lo suyo y el backend rechaza las dos mezclas equivocadas.
     *
     * El `if` en vez de un `values.file!` es a propósito. El schema ya garantiza
     * el archivo con transferencia, pero la aserción sería la única línea que se
     * queda mintiendo si alguien toca la validación.
     */
    const submit = (values: CartSchema) => {
        /*
         * `paymentDate` viaja solo con transferencia: es la fecha del
         * comprobante, que la pone quien pagó. Con Mercado Pago no se pregunta y
         * tampoco se manda — el backend usa hoy si no viene, y cuando el
         * proveedor avisa la pisa con la fecha real de la acreditación.
         */
        const payload: CreateCartPaymentPayload | null =
            values.method === PaymentMethods.TRANSFER
                ? values.file
                    ? {
                          items,
                          paymentDate: values.paymentDate,
                          method: PaymentMethods.TRANSFER,
                          file: values.file,
                      }
                    : null
                : { items, method: PaymentMethods.MERCADO_PAGO }

        if (!payload) return

        mutate(payload, {
            onSuccess: (payment) => {
                // Con Mercado Pago el hook redirige y esta pestaña se va: cerrar
                // el diálogo acá haría parpadear el fondo justo antes de salir.
                if (payment.checkoutUrl) return

                setSelection({})
                form.reset()
                setIsOpen(false)
            },
        })
    }

    return (
        <>
            <Button variant="hero" onClick={() => handleOpenChange(true)}>
                {/* Antes decía "Subir comprobante". Dejó de ser cierto para la
                    mitad de los caminos: con Mercado Pago no se sube nada. */}
                <CreditCard /> Pagar cuotas
            </Button>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogTitle className="font-display text-xl font-bold">
                        Pagar cuotas
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
                        Elegí qué pagar de cada persona y cómo lo vas a pagar. Sale un solo
                        pago por el total.
                    </DialogDescription>

                    {isLoading && <Skeleton className="mt-5 h-48 rounded-xl" />}

                    {!isLoading && people.length > 0 && (
                        <div className="mt-5 flex flex-col gap-3">
                            {people.map((person) => (
                                <PersonBlock
                                    key={person.profileId}
                                    person={person}
                                    selection={selection}
                                    onToggle={(target, concept) =>
                                        setSelection((current) =>
                                            togglePick(current, target, concept),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && !hasAnythingToPay && (
                        <p className="mt-5 rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                            No hay nada para pagar por ahora. Cuando arranque el mes que viene
                            vas a poder pagarlo desde acá.
                        </p>
                    )}

                    {hasAnythingToPay && (
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(submit)}
                                className="mt-5 flex flex-col gap-5"
                            >
                                <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
                                    <span className="kicker text-accent-foreground/70">Total</span>
                                    <span className="font-display text-xl font-bold text-accent-foreground">
                                        {formatMoney(total)}
                                    </span>
                                </div>

                                {/* Radios nativos y no un select: son dos opciones
                                    y conviene verlas las dos, con lo que implica
                                    cada una. El `<label>` envuelve al input, así
                                    que toda la tarjeta es el área clickeable y el
                                    foco del teclado sigue siendo el del radio. */}
                                <FormField
                                    control={form.control}
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cómo querés pagar</FormLabel>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {METHOD_OPTIONS.map((option) => (
                                                    <label
                                                        key={option.value}
                                                        className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40 has-[:checked]:border-brand has-[:checked]:bg-accent has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={field.name}
                                                            value={option.value}
                                                            checked={field.value === option.value}
                                                            onChange={() =>
                                                                field.onChange(option.value)
                                                            }
                                                            onBlur={field.onBlur}
                                                            className="mt-0.5 size-4 shrink-0 accent-brand"
                                                        />
                                                        <span className="min-w-0">
                                                            <span className="block text-sm font-semibold text-ink">
                                                                {option.label}
                                                            </span>
                                                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                                                {option.hint}
                                                            </span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* La fecha es del comprobante que subió la persona.
                                    Con Mercado Pago la pone el proveedor, así que no
                                    hay nada que preguntar. */}
                                {isTransfer && (
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
                                )}

                                {isTransfer && (
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
                                )}

                                {!isTransfer && (
                                    <p className="rounded-xl border border-dashed bg-card p-4 text-sm leading-relaxed text-muted-foreground">
                                        Te vamos a llevar a Mercado Pago para completar el
                                        pago. Cuando termines volvés acá solo, y el club te
                                        emite el recibo igual que siempre.
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    variant="hero"
                                    disabled={isPending || items.length === 0}
                                >
                                    {isPending && <Loader2 className="animate-spin" />}
                                    {isTransfer
                                        ? isPending
                                            ? 'Subiendo…'
                                            : 'Enviar comprobante'
                                        : isPending
                                          ? 'Te llevamos a pagar…'
                                          : 'Pagar con Mercado Pago'}
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
