import { z } from 'zod'

/**
 * Reglas de campo compartidas entre auth, admin y el portal del socio.
 *
 * Vivían duplicadas a mano en cuatro archivos y ya habían divergido: el perfil
 * del socio no limitaba teléfono ni domicilio (el backend sí, y devolvía un 400
 * genérico), y la contraseña tenía dos definiciones distintas de "símbolo".
 * Cada regla se define UNA vez acá y los schemas la componen.
 */

/** Nombre y apellido de una persona. */
export const personNameField = z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(25, 'Máximo 25 caracteres')

// Los opcionales aceptan '' porque los forms arrancan con string vacío; se
// limpian antes de enviar (el backend rechaza strings vacíos con whitelist).

export const dniField = z
    .string()
    .regex(/^\d{7,9}$/, 'El DNI debe tener entre 7 y 9 números')
    .or(z.literal(''))

export const phoneField = z.string().max(30, 'Máximo 30 caracteres').or(z.literal(''))

export const addressField = z.string().max(120, 'Máximo 120 caracteres').or(z.literal(''))

export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 64

/**
 * Copia carácter por carácter de `PASSWORD_REGEX` en el backend
 * (`src/common/constants/password.constant.ts`). Si cambia allá, cambia acá.
 *
 * Exige minúscula, mayúscula, número y símbolo, pero SIN lista blanca: el
 * símbolo es cualquier cosa que no sea letra ni número, y el resto de la
 * contraseña no tiene restricción. Con `\p{Ll}`/`\p{Lu}` la ñ y las vocales
 * acentuadas cuentan como letras de verdad: `Ñ` satisface la mayúscula y `ú`
 * la minúscula.
 *
 * El flag `u` es obligatorio: sin él `\p{...}` no compila.
 */
export const PASSWORD_REGEX = /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*\d)(?=.*[^\p{L}\p{N}]).{6,64}$/u

const PASSWORD_RULE_MESSAGE = `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres e incluir al menos una minúscula, una mayúscula, un número y un símbolo`

/**
 * Contraseña, para registro, reset y alta de staff.
 *
 * El largo se valida aparte de la regex —que ya lo cubre con `{6,64}`— solo
 * para dar un mensaje más preciso en el error más común. La regex sigue siendo
 * la que manda sobre la composición.
 */
export const passwordField = z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
    .max(PASSWORD_MAX_LENGTH, `Máximo ${PASSWORD_MAX_LENGTH} caracteres`)
    .regex(PASSWORD_REGEX, PASSWORD_RULE_MESSAGE)
