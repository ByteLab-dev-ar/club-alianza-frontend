import { useState } from 'react'
import { Loader2, Plus, Tags, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/api/clubApi'

interface Category {
    id: string
    name: string
    color: string
}

interface Props {
    title: string
    categories: Category[]
    onCreate: (payload: { name: string; color: string }) => Promise<unknown>
    onDelete: (id: string) => Promise<unknown>
    isMutating: boolean
}

/** Gestor de categorías (nombre + color hex), compartido por eventos y galería. */
export const CategoryManagerDialog = ({
    title,
    categories,
    onCreate,
    onDelete,
    isMutating,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [color, setColor] = useState('#00CCFF')

    const handleCreate = async () => {
        if (name.trim().length === 0) {
            toast.error('Ingresá un nombre')
            return
        }
        try {
            await onCreate({ name: name.trim(), color })
            toast.success('Categoría creada')
            setName('')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos crear la categoría'))
        }
    }

    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await onDelete(id)
            toast.success('Categoría eliminada')
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'No pudimos eliminar la categoría'))
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Tags /> Categorías
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Creá y eliminá categorías. Al borrar una, los elementos que la usaban quedan
                        sin categoría.
                    </DialogDescription>
                </DialogHeader>

                {/* Es un <form> para que Enter en el nombre cree la categoría,
                    como en el resto de los formularios del panel. */}
                <form
                    className="mt-4 flex items-end gap-2"
                    onSubmit={(event) => {
                        event.preventDefault()
                        void handleCreate()
                    }}
                >
                    <div className="flex-1">
                        <label
                            htmlFor="category-name"
                            className="kicker mb-1.5 block text-muted-foreground"
                        >
                            Nombre
                        </label>
                        <Input
                            id="category-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Ej. Partido"
                            maxLength={40}
                        />
                    </div>
                    <input
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        className="h-11 w-12 cursor-pointer rounded-lg border"
                        aria-label="Color de la categoría"
                    />
                    <Button type="submit" variant="dark" disabled={isMutating}>
                        {isMutating ? <Loader2 className="animate-spin" /> : <Plus />}
                    </Button>
                </form>

                <div className="mt-5 flex flex-col gap-2">
                    {categories.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Todavía no hay categorías.
                        </p>
                    )}
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                            <span className="flex items-center gap-2.5 text-sm font-semibold">
                                <span
                                    className="size-4 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => void handleDelete(category.id)}
                                // Sin esto, un doble clic mandaba dos DELETE y el
                                // segundo terminaba en un toast de error por 404.
                                disabled={deletingId !== null}
                                className="text-muted-foreground transition-colors hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                                aria-label={`Eliminar ${category.name}`}
                            >
                                {deletingId === category.id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Trash2 className="size-4" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
