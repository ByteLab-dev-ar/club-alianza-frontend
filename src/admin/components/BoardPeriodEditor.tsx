import { useState } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/api/clubApi'
import { useSetBoardPeriod } from '../hooks/useAdminInstitutional'

interface Props {
    period: string | null
}

export const BoardPeriodEditor = ({ period }: Props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(period ?? '')
    const { mutateAsync, isPending } = useSetBoardPeriod()

    const save = async () => {
        try {
            await mutateAsync(value.trim())
            toast.success('Período actualizado')
            setIsEditing(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos actualizar el período'))
        }
    }

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3">
                <div>
                    <p className="kicker text-muted-foreground">Período vigente</p>
                    <p className="font-display text-lg font-bold text-ink">
                        {period || 'Sin definir'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        // Sincroniza con el valor ACTUAL del prop: el useState se
                        // capturó al montar y puede haber quedado viejo tras un
                        // refetch (o una edición de otro admin).
                        setValue(period ?? '')
                        setIsEditing(true)
                    }}
                >
                    <Pencil /> Editar
                </Button>
            </div>
        )
    }

    return (
        // Un <form> para que Enter guarde, como en el resto de los formularios.
        <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
                event.preventDefault()
                void save()
            }}
        >
            <div>
                <label htmlFor="board-period" className="kicker mb-1.5 block text-muted-foreground">
                    Período
                </label>
                <Input
                    id="board-period"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="2025–2028"
                    className="w-40"
                />
            </div>
            <Button type="submit" variant="hero" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Guardar
            </Button>
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
            >
                Cancelar
            </Button>
        </form>
    )
}
