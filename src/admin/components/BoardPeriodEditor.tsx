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
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil /> Editar
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-end gap-2">
            <div>
                <label className="kicker mb-1.5 block text-muted-foreground">Período</label>
                <Input
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="2025–2028"
                    className="w-40"
                />
            </div>
            <Button variant="hero" onClick={() => void save()} disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Guardar
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                Cancelar
            </Button>
        </div>
    )
}
