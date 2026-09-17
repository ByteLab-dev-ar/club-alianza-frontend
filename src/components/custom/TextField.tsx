import type { ReactNode } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

interface Props<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label: string
    type?: 'text' | 'email' | 'date' | 'time' | 'month' | 'number'
    placeholder?: string
    description?: ReactNode
    disabled?: boolean
    inputMode?: 'text' | 'numeric' | 'tel'
    /**
     * Tope de caracteres del campo. Acompaña al `.max()` del schema, no lo
     * reemplaza: frena mientras se tipea en vez de avisar recién al guardar.
     */
    maxLength?: number
    /** Renderiza un <Textarea> en vez de un <Input>. */
    multiline?: boolean
    rows?: number
    min?: number
    step?: string
}

/**
 * El bloque FormField → FormItem → FormLabel → FormControl → Input → FormMessage
 * aparecía casi treinta veces idéntico entre los formularios del panel y del
 * portal. Acá queda una sola vez, con la asociación label/input y el mensaje de
 * error garantizados en todos los campos.
 */
export const TextField = <T extends FieldValues>({
    control,
    name,
    label,
    type = 'text',
    placeholder,
    description,
    disabled,
    inputMode,
    maxLength,
    multiline = false,
    rows = 3,
    min,
    step,
}: Props<T>) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    {multiline ? (
                        <Textarea
                            rows={rows}
                            placeholder={placeholder}
                            disabled={disabled}
                            maxLength={maxLength}
                            {...field}
                        />
                    ) : (
                        <Input
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            inputMode={inputMode}
                            maxLength={maxLength}
                            min={min}
                            step={step}
                            {...field}
                        />
                    )}
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
            </FormItem>
        )}
    />
)
