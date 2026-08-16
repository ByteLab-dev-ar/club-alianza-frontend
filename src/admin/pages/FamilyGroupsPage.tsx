import { useState } from 'react'
import { Check, Loader2, Plus, Trash2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { AddGroupMemberDialog } from '../components/AddGroupMemberDialog'
import {
    useAddFamilyGroupMember,
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
    const { mutateAsync: createGroup, isPending: isCreating } = useCreateFamilyGroup()
    const { mutateAsync: addMember, isPending: isAdding } = useAddFamilyGroupMember()

    const isPending = isCreating || isAdding

    const confirm = async () => {
        const group = await createGroup(suggestion.suggestedName)
        // De a uno y en serie: el endpoint recibe un socio por llamada, y si
        // alguno rebota —ya está en otro grupo— los anteriores quedaron bien.
        for (const member of suggestion.members) {
            await addMember({ id: group.id, profileId: member.id })
        }
    }

    return (
        <div className="rounded-xl border bg-card p-5 shadow-soft">
            <p className="font-display font-bold text-ink">{suggestion.suggestedName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Comparten tutor: {suggestion.sharedGuardianName}
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

            <Button variant="hero" size="sm" className="mt-4" disabled={isPending} onClick={() => void confirm()}>
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
                kicker="Cobros"
                title="Grupos familiares"
                description="Con dos o más del grupo marcados como jugadores, la actividad sale al 50% para todos. Los cambios rigen desde el mes siguiente."
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
                                key={`${suggestion.suggestedName}-${suggestion.sharedGuardianName}`}
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
                                        <AddGroupMemberDialog
                                            groupId={group.id}
                                            groupName={group.name}
                                        />
                                        {group.members.length === 0 && (
                                            <ConfirmDialog
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                }
                                                title="Borrar el grupo"
                                                description="Está vacío, así que no afecta ningún cobro."
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
                                        Sin integrantes este mes.
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
                                                    description="Este mes todavía cuenta para el descuento; deja de contar el que viene. Lo que ya se cobró no se recalcula."
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
