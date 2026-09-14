/**
 * En qué tono se pinta el estado, y no son tres niveles de gravedad: son tres
 * consecuencias distintas.
 *
 * - `ok` — no falta nada.
 * - `falta` — le falta algo, pero **entra igual**. Va en ámbar, nunca en rojo:
 *   un jugador al día con el club no puede parecer rechazado en la puerta.
 * - `bloquea` — la membresía. Es la única cobertura que deja a alguien afuera.
 */
export type CredentialTone = 'ok' | 'falta' | 'bloquea'

export interface CredentialStatus {
    /** Ya redactado, listo para la pastilla. */
    label: string
    tone: CredentialTone
}

/** Lo mínimo para decidir el estado. Es un subconjunto de `Credential`. */
export interface CoverageInput {
    isPlayer: boolean
    /** La MEMBRESÍA: si entra al club. */
    isActive: boolean
    /** Si ENTRENA. Vencida no bloquea la entrada. */
    isActivityUpToDate: boolean
    /** Cobertura médica. No bloquea nada. */
    isInsuranceUpToDate: boolean
}

/**
 * Las tres coberturas resumidas en UNA sola línea.
 *
 * La credencial mostraba tres renglones —"Entra", "Entrena", "Seguro"— donde el
 * socio que no juega tenía uno solo. Para un jugador eso es un bloque de texto
 * que hay que leer entero para saber si está bien, justo en el momento en que
 * alguien lo está mirando en la puerta.
 *
 * La regla, en orden, y el orden ES la regla:
 *
 * 1. **Si falta la membresía, manda ella y nada más.** Es la única que deja
 *    afuera, así que se dice sola aunque el resto esté al día: mezclarla con las
 *    otras escondería lo único que impide entrar.
 * 2. **Si la membresía está al día y falta otra cosa, se nombra en ámbar.** No
 *    es un rechazo — entra igual, no entrena.
 * 3. **Si no falta nada, "Todo al día".**
 *
 * Con dos o más faltantes se CUENTA en vez de enumerar: "Actividad y seguro
 * vencidos" no entra en una pastilla de 12px, "2 cuotas vencidas" sí, y quien
 * quiera el detalle lo tiene en su pantalla de pagos.
 *
 * Dice el HECHO y no el veredicto: en ningún caso escribe "No entra". A quien
 * mira su propia credencial le sirve más saber qué le falta que enterarse de
 * que lo rechazan.
 */
export const credentialStatus = (coverage: CoverageInput): CredentialStatus => {
    if (!coverage.isActive) {
        return { label: 'Membresía vencida', tone: 'bloquea' }
    }

    /*
     * Al socio que no juega no se le evalúan la actividad ni el seguro: no le
     * faltan, no le corresponden. Marcárselas sería inventarle una deuda.
     */
    const missing: string[] = []
    if (coverage.isPlayer) {
        // Cada una con su frase: "Seguro vencida" estaría mal escrito, y la
        // credencial es un documento del club.
        if (!coverage.isActivityUpToDate) missing.push('Actividad vencida')
        if (!coverage.isInsuranceUpToDate) missing.push('Seguro vencido')
    }

    if (missing.length === 0) return { label: 'Todo al día', tone: 'ok' }
    if (missing.length === 1) return { label: missing[0]!, tone: 'falta' }

    return { label: `${missing.length} cuotas vencidas`, tone: 'falta' }
}
