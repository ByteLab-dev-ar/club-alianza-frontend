import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Check, Loader2, Printer, Search, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { formatMoney, formatMonth } from '@/lib/format'
import { PAYMENT_CONCEPT_LABELS } from '@/payments/interfaces/Payment'
import { PayableNotes, PayableRow } from '@/payments/components/PayableRow'
import {
    isPicked,
    selectedTotal,
    togglePick,
    type PayablePerson,
    type PayableSelection,
} from '@/payments/lib/payable-selection'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { useMembers } from '../hooks/useMembers'
import { useCounterPeople, useChargeAtCounter } from '../hooks/useCounter'
import { collidingTransfers } from '../lib/counter-collisions'
import type { CounterChargeResult, CounterPerson } from '../interfaces/Counter'

/**
 * El padrón llama `id` a lo que el carrito llama `profileId`: es el mismo dato.
 * Normalizarlo acá deja que la selección del carrito sirva tal cual, en vez de
 * tener una segunda implementación de la cadena de §5.3 en el navegador.
 */
const asPayablePerson = (person: CounterPerson): PayablePerson => ({
    profileId: person.id,
    payable: person.payable,
})

/**
 * El mostrador (§5.10), para ADMIN y tesorería.
 *
 * > El cobro presencial no es otro sistema: es el mismo carrito, operado por
 * > tesorería.
 *
 * Recepción no entra: escanear credenciales es otra función.
 *
 * Cuatro cosas que esta pantalla tiene que hacer bien porque hay plata sobre la
 * mesa y una persona esperando: buscar a la familia entera de una, **decir el
 * importe antes de recibir la plata**, avisar de las transferencias pendientes
 * ANTES de cobrar, y mostrar el recibo en el acto —la persona se va con el
 * papel, no hay un segundo momento para pedir el código—.
 *
 * **Y una que tiene que NO hacer: bloquear al moroso.** El carrito de la app le
 * viene vacío y con el cartel de "acercate a la sede"; acá le llegan los precios
 * igual, porque la sede es esto y es el único camino que le queda para salir.
 */
export const CounterPage = () => {
    const [search, setSearch] = useState('')
    const [payerId, setPayerId] = useState<string | null>(null)
    const [selection, setSelection] = useState<PayableSelection>({})
    const [customAmount, setCustomAmount] = useState('')
    const [amountReason, setAmountReason] = useState('')
    const [result, setResult] = useState<CounterChargeResult | null>(null)

    const debouncedSearch = useDebouncedValue(search, 350)
    const { data: searchResults } = useMembers({
        page: 1,
        limit: 6,
        search: debouncedSearch || undefined,
    })

    const { data: people = [], isLoading } = useCounterPeople(payerId ?? undefined)
    const { mutate: charge, isPending } = useChargeAtCounter()

    const items = Object.entries(selection).map(([profileId, concepts]) => ({
        profileId,
        concepts,
    }))

    const collisions = collidingTransfers(people, selection)
    const hasCustomAmount = customAmount.trim().length > 0
    const canCharge =
        items.length > 0 && (!hasCustomAmount || amountReason.trim().length > 0) && !isPending

    /*
     * El número que el tesorero dice en voz alta. Es el mismo cálculo que el
     * carrito y sigue siendo informativo: el que vale lo hace el servidor con
     * los precios vigentes, y el importe nunca viaja desde el navegador —salvo
     * el distinto, que va aparte y con motivo.
     */
    const total = selectedTotal(people.map(asPayablePerson), selection)
    const hasAnythingToCharge = people.some((person) => person.payable.length > 0)

    const reset = () => {
        setPayerId(null)
        setSelection({})
        setCustomAmount('')
        setAmountReason('')
        setSearch('')
    }

    /* El recibo recién emitido: la pantalla que se imprime en el acto. */
    if (result) {
        return (
            <>
                <AdminPageHeader kicker="Mostrador" title="Cobro registrado" />

                <div className="rounded-xl border bg-card p-8 text-center shadow-soft">
                    <Check className="mx-auto size-10 text-success" />
                    <p className="text-display mt-4 text-2xl text-ink">
                        Recibo N° {result.receiptNumber}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                        {formatMoney(result.total)}
                    </p>

                    {/*
                     * Los comprobantes que este cobro dejó rechazados. Mostrarlos
                     * es parte del flujo: antes el rechazo pasaba en silencio y
                     * la familia que había transferido Y pagado en efectivo se
                     * enteraba sola.
                     */}
                    {result.rejectedPaymentIds.length > 0 && (
                        <div className="mx-auto mt-6 max-w-md rounded-lg border border-warning/40 bg-warning/10 p-4 text-left">
                            <p className="flex items-center gap-2 text-sm font-bold text-ink">
                                <TriangleAlert className="size-4 shrink-0 text-warning-strong" />
                                {result.rejectedPaymentIds.length === 1
                                    ? 'Se rechazó una transferencia'
                                    : `Se rechazaron ${result.rejectedPaymentIds.length} transferencias`}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Cubrían lo mismo que este cobro, así que quedaron rechazadas
                                con el motivo "se cobró en la sede". Avisale a la persona: si
                                además transfirió, el club recibió plata de más.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        {/* La persona se va con el papel: imprimir es el paso
                            siguiente, no una opción escondida. */}
                        <Button asChild variant="hero">
                            <Link to={`/recibos/${result.paymentId}`}>
                                <Printer /> Ver e imprimir el recibo
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setResult(null)
                                reset()
                            }}
                        >
                            Cobrar a otra persona
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <AdminPageHeader
                kicker="Mostrador"
                title="Cobrar en efectivo"
                description="Buscá a la persona y aparecen también los chicos que tiene a cargo: una familia se resuelve en una sola operación. El pago se acredita en el acto."
            />

            {!payerId ? (
                <div className="rounded-xl border bg-card p-6 shadow-soft">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar por nombre, apellido o email…"
                            className="pl-10"
                            autoFocus
                        />
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        {(searchResults?.items ?? []).map((member) => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() => setPayerId(member.id)}
                                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:border-secondary hover:bg-accent"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-semibold text-ink">
                                        {member.name} {member.surname}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {member.memberNumber
                                            ? `Socio N° ${member.memberNumber}`
                                            : 'Sin número'}
                                        {member.dni ? ` · DNI ${member.dni}` : ''}
                                    </p>
                                </div>
                                {/* La morosidad NO frena el mostrador: es al revés,
                                    es el único camino que le queda al moroso. Se
                                    muestra como dato, no como impedimento. */}
                                {member.delinquentSince && (
                                    <Badge variant="warning">Moroso</Badge>
                                )}
                            </button>
                        ))}

                        {debouncedSearch && (searchResults?.items ?? []).length === 0 && (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No hay socios que coincidan.
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <Button variant="ghost" size="sm" className="-ml-2 mb-4" onClick={reset}>
                        <ArrowLeft /> Buscar a otra persona
                    </Button>

                    {isLoading ? (
                        <Skeleton className="h-64 rounded-xl" />
                    ) : (
                        <div className="flex flex-col gap-4">
                            {people.map((person) => (
                                <div
                                    key={person.id}
                                    className="rounded-xl border bg-card p-5 shadow-soft"
                                >
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="font-display font-bold text-ink">
                                            {person.name} {person.surname}
                                            {person.id === payerId && (
                                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                    (paga)
                                                </span>
                                            )}
                                        </p>
                                        {person.memberNumber && (
                                            <p className="kicker text-muted-foreground">
                                                Socio N° {person.memberNumber}
                                            </p>
                                        )}
                                    </div>

                                    {/* El aviso de §5.10, antes de cobrar. */}
                                    {person.pendingTransfers.length > 0 && (
                                        <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
                                            <p className="flex items-center gap-2 text-xs font-bold text-ink">
                                                <TriangleAlert className="size-3.5 shrink-0 text-warning-strong" />
                                                Tiene transferencias esperando validación
                                            </p>
                                            <ul className="mt-1.5 text-xs text-muted-foreground">
                                                {person.pendingTransfers.map((transfer) => (
                                                    <li
                                                        key={`${transfer.concept}-${transfer.month}`}
                                                    >
                                                        {PAYMENT_CONCEPT_LABELS[transfer.concept]}{' '}
                                                        de {formatMonth(transfer.month)}
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                                Si cobrás lo mismo acá, esos comprobantes quedan
                                                rechazados automáticamente.
                                            </p>
                                        </div>
                                    )}

                                    {/* Con precio y con mes: el tesorero tiene que
                                        poder decir cuánto es antes de recibir la
                                        plata. Lo que no aparece acá no se puede
                                        cobrar, y el porqué lo dicen las notas. */}
                                    {person.payable.length > 0 && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            {person.payable.map((item) => (
                                                <PayableRow
                                                    key={`${item.concept}-${item.month}`}
                                                    item={item}
                                                    checked={isPicked(
                                                        selection,
                                                        person.id,
                                                        item.concept,
                                                    )}
                                                    onToggle={() =>
                                                        setSelection((current) =>
                                                            togglePick(
                                                                current,
                                                                asPayablePerson(person),
                                                                item.concept,
                                                            ),
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {person.notes.length > 0 && (
                                        <div className="mt-3">
                                            <PayableNotes notes={person.notes} />
                                        </div>
                                    )}

                                    {/* Sin nada que cobrar y sin aclaraciones: está
                                        todo cubierto. El backend no manda nota en
                                        ese caso porque es el estado normal, y sin
                                        este renglón la persona queda con un bloque
                                        vacío que parece un error. */}
                                    {person.payable.length === 0 && person.notes.length === 0 && (
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            Está al día. No hay nada para cobrarle este mes.
                                        </p>
                                    )}
                                </div>
                            ))}

                            {!hasAnythingToCharge && (
                                <p className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                                    No hay nada para cobrarle a esta familia este mes.
                                </p>
                            )}

                            {hasAnythingToCharge && (
                            <div className="rounded-xl border bg-card p-5 shadow-soft">
                                {/*
                                 * El total va arriba de todo y grande: es lo que el
                                 * tesorero dice en voz alta antes de recibir la
                                 * plata. Hasta que el endpoint mandó `payable`, el
                                 * número aparecía recién en el recibo, con la
                                 * persona ya pagando.
                                 */}
                                <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
                                    <span className="kicker text-accent-foreground/70">
                                        Total a cobrar
                                    </span>
                                    <span className="font-display text-2xl font-bold text-accent-foreground">
                                        {formatMoney(total)}
                                    </span>
                                </div>

                                {/*
                                 * El monto lo calcula el sistema. El tesorero puede
                                 * cobrar otro CON MOTIVO —cobrar atrasos es una
                                 * conversación de mostrador—, pero la cobertura
                                 * otorgada sigue siendo el mes corriente y nada
                                 * más: la plata de más es plata que el club
                                 * recibió, no un saldo a favor ni meses
                                 * adelantados.
                                 */}
                                <p className="mt-4 text-sm text-muted-foreground">
                                    El importe lo calcula el sistema con los precios vigentes y
                                    el descuento que corresponda. Si cobrás otro, escribí por
                                    qué.
                                </p>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="counter-amount">
                                            Importe distinto (opcional)
                                        </Label>
                                        <Input
                                            id="counter-amount"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={customAmount}
                                            onChange={(event) =>
                                                setCustomAmount(event.target.value)
                                            }
                                            placeholder="Dejalo vacío para el calculado"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="counter-reason">
                                            Motivo {hasCustomAmount && '(obligatorio)'}
                                        </Label>
                                        <Textarea
                                            id="counter-reason"
                                            rows={2}
                                            value={amountReason}
                                            onChange={(event) =>
                                                setAmountReason(event.target.value)
                                            }
                                            disabled={!hasCustomAmount}
                                            placeholder="Ej. arreglo por meses atrasados."
                                        />
                                    </div>
                                </div>

                                {collisions.length > 0 && (
                                    <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm leading-relaxed text-muted-foreground">
                                        Este cobro pisa {collisions.length}{' '}
                                        {collisions.length === 1
                                            ? 'transferencia que está'
                                            : 'transferencias que están'}{' '}
                                        esperando validación. Al confirmar{' '}
                                        {collisions.length === 1 ? 'queda' : 'quedan'} rechazada
                                        {collisions.length === 1 ? '' : 's'}.
                                    </p>
                                )}

                                <Button
                                    variant="hero"
                                    className="mt-5"
                                    disabled={!canCharge}
                                    onClick={() =>
                                        charge(
                                            {
                                                payerProfileId: payerId,
                                                items,
                                                ...(hasCustomAmount
                                                    ? {
                                                          amount: Number(customAmount),
                                                          amountReason: amountReason.trim(),
                                                      }
                                                    : {}),
                                            },
                                            { onSuccess: setResult },
                                        )
                                    }
                                >
                                    {isPending && <Loader2 className="animate-spin" />}
                                    {isPending ? 'Cobrando…' : 'Cobrar y emitir recibo'}
                                </Button>

                                {items.length === 0 && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Tildá al menos un concepto.
                                    </p>
                                )}
                            </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </>
    )
}
