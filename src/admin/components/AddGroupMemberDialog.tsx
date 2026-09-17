import { useState } from 'react'
import { Check, Loader2, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/api/clubApi'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useMembers } from '../hooks/useMembers'
import { useAddFamilyGroupMember } from '../hooks/useFamilyGroups'
import { groupMemberCandidates } from '../lib/family-groups'
import type { FamilyGroup } from '../actions/family-groups.actions'

interface Props {
    group: FamilyGroup
}

/**
 * Sumar un socio a un grupo familiar.
 *
 * Se busca en el padrón porque el grupo lo confirma el club, socio por socio: no
 * se deduce de quién comparte tutor. La pantalla dice desde cuándo cuenta —el
 * próximo pago que se arme— porque el que suma a un hermano después de que la
 * familia pagó espera que el descuento le devuelva algo de ese pago, y no es
 * así: lo ya cobrado quedó con su importe.
 *
 * **Por qué se recuerda a quién se sumó en esta apertura.** La pertenencia rige
 * desde ya, así que tras el refresco el recién sumado está en `group.members` y
 * el filtro de candidatos lo sacaría de la lista, llevándose su "Sumado". El
 * registro lo mantiene a la vista con la confirmación, y además tapa la ventana
 * entre el click y el refresco, en la que el botón volvía a decir "Sumar" y el
 * segundo click contestaba "ese socio ya está en este grupo". La regla vive en
 * `groupMemberCandidates`.
 */
export const AddGroupMemberDialog = ({ group }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [justAdded, setJustAdded] = useState<string[]>([])
    /**
     * Por qué NO se pudo sumar a alguien, por socio.
     *
     * El 409 dice tres cosas distintas —ya está en este grupo, ya pertenece a
     * otro, o todavía no es socio— y ninguna de las tres se puede anticipar
     * desde el listado del padrón. Guardarlas acá hace que el error se pague una
     * sola vez: después del primer intento el botón deja de ofrecerse y en su
     * lugar queda escrito el motivo, en vez de un toast que se va y un botón que
     * sigue invitando a repetir.
     */
    const [rejected, setRejected] = useState<Record<string, string>>({})
    const debouncedSearch = useDebouncedValue(search, 350)

    const { data, isFetching } = useMembers({
        page: 1,
        limit: 8,
        search: debouncedSearch || undefined,
    })
    const { mutate, isPending } = useAddFamilyGroupMember()

    const candidates = groupMemberCandidates(
        data?.items ?? [],
        group.members.map((member) => member.id),
        justAdded,
    )

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) {
                    setSearch('')
                    setJustAdded([])
                    setRejected({})
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus /> Sumar socio
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogTitle className="font-display text-xl font-bold">
                    Sumar a {group.name}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Cuenta para el descuento{' '}
                    <strong className="font-semibold text-ink">desde el próximo pago</strong>: lo
                    ya cobrado no se recalcula. Solo entran socios del club.
                </DialogDescription>

                <div className="relative mt-5">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por nombre, apellido o email…"
                        className="pl-10"
                    />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    {isFetching && candidates.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Buscando…
                        </p>
                    )}

                    {!isFetching && candidates.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No hay socios que coincidan.
                        </p>
                    )}

                    {candidates.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-ink">
                                    {member.name} {member.surname}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {member.memberNumber
                                        ? `Socio N° ${member.memberNumber}`
                                        : 'Sin número'}
                                    {member.isPlayer ? ' · Jugador' : ''}
                                </p>
                            </div>
                            {/* Al que se acaba de sumar no se le vuelve a
                                ofrecer el botón: la pertenencia ya existe y
                                cuenta desde ya.

                                La frase va en tinta y el verde en el tilde:
                                dice desde cuándo corre el descuento —un dato de
                                plata que el admin tiene que leer— y en verde
                                daba 4.01:1 con 12px, abajo del 4.5:1. */}
                            {justAdded.includes(member.id) ? (
                                <p className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-ink">
                                    <Check className="size-3.5 text-success" />
                                    Sumado · cuenta desde el próximo pago
                                </p>
                            ) : rejected[member.id] ? (
                                <p className="max-w-56 shrink-0 text-right text-xs text-muted-foreground">
                                    {rejected[member.id]}
                                </p>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isPending}
                                    onClick={() =>
                                        mutate(
                                            { id: group.id, profileId: member.id },
                                            {
                                                // El diálogo NO se cierra: una
                                                // familia se carga de a varios, y
                                                // reabrirlo por cada hermano era
                                                // volver a buscar cada vez.
                                                onSuccess: () =>
                                                    setJustAdded((current) => [
                                                        ...current,
                                                        member.id,
                                                    ]),
                                                onError: (error) =>
                                                    setRejected((current) => ({
                                                        ...current,
                                                        [member.id]: getApiErrorMessage(
                                                            error,
                                                            'No se pudo sumar',
                                                        ),
                                                    })),
                                            },
                                        )
                                    }
                                >
                                    {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                                    Sumar
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
