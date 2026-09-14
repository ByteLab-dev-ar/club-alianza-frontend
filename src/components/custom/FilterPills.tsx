import { cn } from '@/lib/utils'

interface Option<T extends string> {
    value: T
    label: string
}

interface Props<T extends string> {
    options: readonly Option<T>[]
    value: T
    onChange: (value: T) => void
}

/**
 * Grupo de filtros tipo píldora, sobre el contenido claro.
 *
 * **Solo sobre el contenido.** Tenía un `tone="band"` para montarse además en la
 * banda superior del panel; se retiró junto con `size`, que había quedado sin
 * ningún llamador. Los filtros de la banda son otra cosa y viven en
 * `FilterTabs`: allá el estado activo lo marca un filete apoyado en el borde, y
 * no un relleno celeste, que es el lenguaje de la sección activa del menú.
 *
 * Acá el relleno sí puede ser sólido: sobre superficie clara no compite con nada.
 */
export const FilterPills = <T extends string>({ options, value, onChange }: Props<T>) => (
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
                        'rounded-md px-4 py-2 text-xs transition-colors',
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
