import { useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useMembers } from '../hooks/useMembers'
import { useAddFamilyGroupMember } from '../hooks/useFamilyGroups'

interface Props {
    groupId: string
    groupName: string
}

/**
 * Sumar un socio a un grupo familiar.
 *
 * Se busca en el padrón porque el grupo lo confirma el club, socio por socio: no
 * se deduce de quién comparte tutor. La pantalla dice desde cuándo cuenta —el
 * mes que viene— porque el que agrega a alguien a mitad de mes espera que el
 * descuento salga en el cobro de ese mes, y no es así.
 */
export const AddGroupMemberDialog = ({ groupId, groupName }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, 350)

    const { data, isFetching } = useMembers({
        page: 1,
        limit: 8,
        search: debouncedSearch || undefined,
    })
    const { mutate, isPending } = useAddFamilyGroupMember()

    const candidates = data?.items ?? []

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open)
                if (open) setSearch('')
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus /> Sumar socio
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogTitle className="font-display text-xl font-bold">
                    Sumar a {groupName}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Cuenta para el descuento{' '}
                    <strong className="font-semibold text-ink">desde el mes que viene</strong>: lo
                    que se cobra este mes ya quedó generado. Solo entran socios del club.
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
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isPending}
                                onClick={() =>
                                    mutate(
                                        { id: groupId, profileId: member.id },
                                        { onSuccess: () => setIsOpen(false) },
                                    )
                                }
                            >
                                {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                                Sumar
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
