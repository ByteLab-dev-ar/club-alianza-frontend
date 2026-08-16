import type { ReactNode } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

export interface SelectFieldOption {
    value: string
    label: string
}

interface Props<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label: string
    options: readonly SelectFieldOption[]
    placeholder?: string
    description?: ReactNode
    disabled?: boolean
}

/**
 * El gemelo de `TextField` para los campos de opciones cerradas.
 *
 * Ojo con una restricción de Radix que decide la forma de esta API: **un
 * `SelectItem` no puede tener `value=""`**, porque el string vacío es lo que el
 * componente usa internamente para "sin elegir". Por eso el "todavía no cargado"
 * se representa con el valor vacío en el form —que muestra el `placeholder`— y
 * nunca como una opción de la lista.
 */
export const SelectField = <T extends FieldValues>({
    control,
    name,
    label,
    options,
    placeholder,
    description,
    disabled,
}: Props<T>) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <Select
                    value={field.value as string}
                    onValueChange={field.onChange}
                    disabled={disabled}
                >
                    <FormControl>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
            </FormItem>
        )}
    />
)
