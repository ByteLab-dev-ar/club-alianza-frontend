import { useEffect, useState } from 'react'

/** Devuelve `value` recién después de `delay` ms sin cambios. Para no spamear la API al tipear. */
export const useDebouncedValue = <T,>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}
