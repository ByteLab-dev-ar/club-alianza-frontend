import { cn } from '@/lib/utils'

interface Category {
    id: string
    name: string
    color: string
}

interface Props {
    categories: Category[]
    /** `undefined` = "Todos". */
    selectedId?: string
    onSelect: (categoryId?: string) => void
}

/**
 * Chips de filtro por categoría. Las categorías (y su color) vienen del backend,
 * así que no hay una lista fija de tipos hardcodeada acá.
 */
export const CategoryFilter = ({ categories, selectedId, onSelect }: Props) => {
    const baseChip =
        'rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer'

    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onSelect(undefined)}
                aria-pressed={!selectedId}
                className={cn(
                    baseChip,
                    !selectedId
                        ? 'border-transparent bg-ink text-background'
                        : 'border-border bg-card text-muted-foreground hover:border-ink/30',
                )}
            >
                Todos
            </button>

            {categories.map((category) => {
                const isSelected = category.id === selectedId

                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onSelect(category.id)}
                        aria-pressed={isSelected}
                        className={cn(baseChip, !isSelected && 'bg-card hover:opacity-80')}
                        style={
                            isSelected
                                ? {
                                      backgroundColor: category.color,
                                      borderColor: category.color,
                                      color: '#fff',
                                  }
                                : { borderColor: `${category.color}66`, color: category.color }
                        }
                    >
                        {category.name}
                    </button>
                )
            })}
        </div>
    )
}
