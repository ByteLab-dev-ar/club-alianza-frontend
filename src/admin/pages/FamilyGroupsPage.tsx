import { useRef, useState } from 'react'
import { Check, Loader2, Plus, Trash2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AddGroupMemberDialog } from '../components/AddGroupMemberDialog'
import {
    useConfirmFamilyGroupSuggestion,
    useCreateFamilyGroup,
    useDeleteFamilyGroup,
    useFamilyGroupSuggestions,
    useFamilyGroups,
    useRemoveFamilyGroupMember,
} from '../hooks/useFamilyGroups'
import type { FamilyGroupSuggestion } from '../actions/family-groups.actions'

/**
 * Una sugerencia confirmada en un click: se crea el grupo y se le suman los
 * integrantes propuestos.
 *
 * Es la razón de ser de la pantalla de sugerencias: como el club ya revisa el
 * alta de cada menor una por una, confirmar a qué grupo entra tiene que ser un
 * paso dentro de una revisión que ya está haciendo, no una búsqueda aparte.
 */
const SuggestionCard = ({ suggestion }: { suggestion: FamilyGroupSuggestion }) => {
    // Crear, sumar a cada uno, avisar una vez e invalidar al final: todo
    // adentro del hook, que explica por qué no son dos mutaciones encadenadas.
    const { mutate: confirmSuggestion, isPending } = useConfirmFamilyGroupSuggestion()
    /**
     * El `disabled` solo no alcanza contra el doble click: `isPending` llega a
     * la pantalla en el render siguiente, y un segundo click que entra antes
     * crea otro grupo con el mismo nombre. El ref corta en el mismo instante.
     * Se suelta al terminar, pase lo que pase, por si la tarjeta sigue ahí
     * (crear el grupo falló y no se creó nada).
     */
    const inFlight = useRef(false)

    const confirm = () => {
        if (inFlight.current) return
        inFlight.current = true
        confirmSuggestion(suggestion, {
            onSettled: () => {
                inFlight.current = false
            },
        })
    }

    return (
        <div className="rounded-xl border bg-card p-5 shadow-soft">
            {/* El título es `anchorLabel` y no `suggestedName`, que es el
                apellido: el apellido NO distingue. Con dos familias Fernández que
                no se conocen —que en un club de barrio es lo normal— acá había
                dos tarjetas idénticas y no había forma de saber cuál era cuál.
                `suggestedName` sigue siendo lo que se guarda al confirmar. */}
            <p className="font-display font-bold text-ink">{suggestion.anchorLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Se guarda como "{suggestion.suggestedName}" · Comparten tutor:{' '}
                {suggestion.sharedGuardianName}
            </p>

            <ul className="mt-3 flex flex-wrap gap-2">
                {suggestion.members.map((member) => (
                    <li key={member.id}>
                        <Badge variant="soft">
                            {member.name} {member.surname}
                            {member.isPlayer ? ' · juega' : ''}
                        </Badge>
                    </li>
                ))}
            </ul>

            <Button variant="hero" size="sm" className="mt-4" disabled={isPending} onClick={confirm}>
                {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                Confirmar grupo
            </Button>
        </div>
    )
}

/**
 * Los grupos familiares (§5.4).
 *
 * El grupo es una **entidad que el club confirma**, no algo que el sistema
 * deduzca de quién comparte tutor: el descuento es plata, y si saliera de los
 * vínculos, agregarle un segundo tutor a un chico lo sacaría del conjunto y la
 * familia perdería el 50% sin que nadie lo pidiera ni se enterara.
 *
 * El descuento es **50% en la actividad si hay dos o más del grupo marcados como
 * jugadores; con uno solo se paga 100%**, y se aplica a todos, no del segundo en
 * adelante — pasar de uno a dos sale gratis.
 */
export const FamilyGroupsPage = () => {
    const [newGroupName, setNewGroupName] = useState('')

    const { data: groups = [], isLoading, isError } = useFamilyGroups()
    const { data: suggestions = [] } = useFamilyGroupSuggestions()
    const { mutate: createGroup, isPending: isCreating } = useCreateFamilyGroup()
    const { mutateAsync: deleteGroup } = useDeleteFamilyGroup()
    const { mutateAsync: removeMember } = useRemoveFamilyGroupMember()

    return (
        <>
            <AdminPageHeader
                // "Padrón", como en el menú (`config/nav.ts`): armar una familia
                // es una decisión de membresía, no de mostrador, aunque mueva
                // plata.
                kicker="Padrón"
                title="Grupos familiares"
                description="Con dos o más del grupo marcados como jugadores, la actividad sale al 50% para todos. Los cambios rigen desde el próximo pago que se arme; lo ya cobrado no se recalcula."
            />

            <div className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-5 shadow-soft">
                <div className="min-w-56 flex-1">
                    <p className="kicker mb-2 text-muted-foreground">Nuevo grupo</p>
                    <Input
                        value={newGroupName}
                        onChange={(event) => setNewGroupName(event.target.value)}
                        placeholder="Familia Gómez"
                    />
                </div>
                <Button
                    variant="hero"
                    disabled={isCreating || newGroupName.trim().length < 2}
                    onClick={() =>
                        createGroup(newGroupName.trim(), { onSuccess: () => setNewGroupName('') })
                    }
                >
                    {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
                    Crear grupo
                </Button>
            </div>

            {suggestions.length > 0 && (
                <section className="mb-8">
                    <h2 className="font-display text-lg font-bold text-ink">
                        Sugerencias del sistema
                    </h2>
                    <p className="mt-1 mb-4 max-w-2xl text-sm text-muted-foreground">
                        Estos comparten tutor. Sugerir no es deducir: lo que queda guardado es
                        tu confirmación.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        {suggestions.map((suggestion) => (
                            <SuggestionCard
                                // Por `anchorLabel`, que es lo que de verdad
                                // distingue una sugerencia de otra: el apellido
                                // se repite entre familias que no se conocen.
                                key={`${suggestion.anchorLabel}-${suggestion.sharedGuardianName}`}
                                suggestion={suggestion}
                            />
                        ))}
                    </div>
                </section>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-32 rounded-xl" />
                    ))}
                </div>
            ) : isError ? (
                <p className="rounded-xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                    No pudimos cargar los grupos. Probá recargar en unos minutos.
                </p>
            ) : groups.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-12 text-center">
                    <Users className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Todavía no hay grupos armados. Sin grupo, cada jugador paga la actividad
                        al 100%.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {groups.map((group) => {
                        const playersInGroup = group.members.filter((member) => member.isPlayer)
                        const hasDiscount = playersInGroup.length >= 2

                        return (
                            <section
                                key={group.id}
                                className="rounded-xl border bg-card p-6 shadow-soft"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-display text-lg font-bold text-ink">
                                            {group.name}
                                        </h3>
                                        {/* Acá el nombre SÍ es el título —es el
                                            que el club confirmó— pero sigue sin
                                            ser único, así que abajo va quién
                                            tiene a cargo a quién. Viene `null`
                                            en un grupo sin tutela adentro
                                            (hermanos adultos): ahí no hay a
                                            quién señalar y no se dibuja nada. */}
                                        {group.anchorLabel && (
                                            <p className="text-sm text-muted-foreground">
                                                {group.anchorLabel}
                                            </p>
                                        )}
                                        {/*
                                         * Se cuenta por MARCADOS como jugador, no
                                         * por quién pagó este mes: si se contara
                                         * por pago, el descuento cambiaría según
                                         * qué haya en el carrito y un tutor que
                                         * paga en dos veces pagaría distinto que
                                         * uno que paga junto.
                                         */}
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {playersInGroup.length === 0
                                                ? 'Nadie del grupo está marcado como jugador.'
                                                : hasDiscount
                                                  ? `${playersInGroup.length} jugadores: la actividad les sale al 50% a todos.`
                                                  : 'Un solo jugador: paga la actividad al 100%. Con un segundo, los dos pasan al 50%.'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <AddGroupMemberDialog group={group} />
                                        {/*
                                         * El botón aparece solo sin integrantes,
                                         * y eso ahora es un "se puede" seguro:
                                         * la pertenencia no tiene fechas, y el
                                         * backend cuenta para borrar con el
                                         * mismo criterio con el que lista (sin
                                         * los socios archivados). Antes, con la
                                         * regla del mes siguiente, `members`
                                         * eran los de ESTE mes y un grupo que
                                         * se veía vacío podía contestar 409; el
                                         * diálogo no podía prometer nada. El 409
                                         * que queda es el de otro admin sumando
                                         * a alguien mientras tanto, y lo avisa
                                         * el hook.
                                         */}
                                        {group.members.length === 0 && (
                                            <ConfirmDialog
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        aria-label={`Borrar el grupo ${group.name}`}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                }
                                                title="Borrar el grupo"
                                                description="No tiene integrantes, así que borrarlo no le cambia el descuento a nadie."
                                                confirmLabel="Borrar"
                                                destructive
                                                onConfirm={async () => {
                                                    await deleteGroup(group.id)
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {group.members.length === 0 ? (
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Sin integrantes.
                                    </p>
                                ) : (
                                    <ul className="mt-4 flex flex-col divide-y">
                                        {group.members.map((member) => (
                                            <li
                                                key={member.id}
                                                className="flex flex-wrap items-center justify-between gap-3 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-ink">
                                                        {member.name} {member.surname}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.memberNumber
                                                            ? `Socio N° ${member.memberNumber}`
                                                            : 'Sin número'}
                                                        {member.isPlayer
                                                            ? ` · Jugador${member.playerCategoryLabel ? ` — ${member.playerCategoryLabel}` : ''}`
                                                            : ''}
                                                    </p>
                                                </div>

                                                <ConfirmDialog
                                                    trigger={
                                                        <Button variant="ghost" size="sm">
                                                            Sacar del grupo
                                                        </Button>
                                                    }
                                                    title={`Sacar a ${member.name} del grupo`}
                                                    description="Deja de contar para el descuento desde el próximo pago que se arme. Lo ya cobrado no se recalcula."
                                                    confirmLabel="Sacar del grupo"
                                                    onConfirm={async () => {
                                                        await removeMember({
                                                            id: group.id,
                                                            profileId: member.id,
                                                        })
                                                    }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )
                    })}
                </div>
            )}
        </>
    )
}
