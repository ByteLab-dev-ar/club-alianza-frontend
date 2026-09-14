/**
 * Las iniciales de un nombre para el círculo de la comisión directiva: primera
 * letra del primer nombre y del último apellido.
 *
 * Existe porque el backend no guarda foto de los miembros, y un círculo con
 * iniciales le da a cada renglón un ancla visual sin inventarle una cara a
 * nadie. Tres cosas que no son obvias:
 *
 * - **Primero y último, no las dos primeras palabras.** "María de los Ángeles
 *   Pérez" tiene que dar "MP", no "MD".
 * - **La letra se toma por punto de código**, no por índice: `"Ángel"[0]` anda,
 *   pero con una letra fuera del plano básico el índice parte el carácter en
 *   dos y el círculo muestra un signo roto.
 * - **Mayúscula con reglas del castellano**, para que las tildes queden como
 *   se escriben.
 */
export const initialsOf = (fullName: string): string => {
    const words = fullName.trim().split(/\s+/).filter(Boolean)

    const first = words[0]
    if (!first) return ''

    const last = words.length > 1 ? words[words.length - 1] : undefined
    const letterOf = (word: string) => Array.from(word)[0] ?? ''

    return (letterOf(first) + (last ? letterOf(last) : '')).toLocaleUpperCase('es')
}
