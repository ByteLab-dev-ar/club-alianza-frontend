import { cn } from '@/lib/utils'

interface Option<T extends string> {
    value: T
    label: string
}

interface Props<T extends string> {
    options: readonly Option<T>[]
    value: T
    onChange: (value: T) => void
    /** Los listados con muchas columnas usan píldoras más chicas. */
    size?: 'sm' | 'md'
}

/**
 * Grupo de filtros tipo píldora. Estaba duplicado con los mismos className
 * entre el listado de socios y el de pagos.
 */
export const FilterPills = <T extends string>({
    options,
    value,
    onChange,
    size = 'md',
}: Props<T>) => (
    <div className="flex gap-1 rounded-lg border bg-card p-1">
        {options.map((option) => {
            const isActive = option.value === value

            return (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    aria-pressed={isActive}
                    className={cn(
                        'rounded-md text-xs transition-colors',
                        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
                        isActive
                            ? 'bg-ink font-bold text-background'
                            : 'font-semibold text-muted-foreground hover:text-foreground',
                    )}
                >
                    {option.label}
                </button>
            )
        })}
    </div>
)
