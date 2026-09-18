/**
 * Cómo se nombra el estado de la MEMBRESÍA.
 *
 * **Dice "vigente" y no "al día".** El dato es uno solo —`isActive`, que el
 * backend calcula como `membershipUntil >= hoy` (`member-response.mapper.ts`)— y
 * nombra UNA de las tres coberturas: desde §5 la membresía, la actividad y el
 * seguro vencen por separado, así que "al día" afirmaba "no debe nada" arriba de
 * un jugador que puede tener la actividad vencida sin ser moroso y sin estar
 * bloqueado (PRODUCT.md). Es la palabra de la leyenda del gráfico de Membresía
 * del Resumen y la que la ficha del socio ya escribe en sus filas de cobertura.
 *
 * **Vive en `shared` porque las pantallas que lo muestran no se importan entre
 * sí**: el padrón y la ficha están en `admin` y "Mis chicos" en `members`. Hasta
 * ahora cada una tenía el texto escrito a mano, las dos decían "Al día" y las dos
 * hubo que corregirlas — el mismo enredo que ya pasó con las reglas de
 * `shared/schemas/fields.ts`.
 *
 * **Solo el texto, no el color.** Que la membresía sea la única cobertura que se
 * pinta en rojo es una decisión de cada pantalla, y se explica donde se dibuja.
 */

/**
 * Con el sustantivo adelante: **es la forma por defecto**, la que decidió el
 * dueño y la que usa la leyenda del gráfico de Membresía del Resumen.
 *
 * Se usa donde la píldora está sola, sin nada al lado que diga de qué cobertura
 * se habla: en la ficha del socio va pegada al nombre, y tres filas más abajo
 * esa misma pantalla dibuja las TRES coberturas, cada una diciendo "Vigente"
 * debajo de su rótulo. Un "Vigente" suelto arriba del todo no dice cuál de las
 * tres es. Peor: "vigente" a secas ya significa otra cosa en este producto —el
 * perfil que no está dado de baja (`deletedAt`, ver `MemberProfile`)—, así que
 * al lado de un nombre se lee como "sigue siendo socio" y no como "pagó".
 */
export const membershipStatusLabel = (
    isActive: boolean,
): 'Membresía vigente' | 'Membresía vencida' =>
    isActive ? 'Membresía vigente' : 'Membresía vencida'

/**
 * La palabra sola, para cuando el sustantivo ya está escrito al lado y repetirlo
 * no cabe: la celda del padrón, que tiene la columna "Membresía" pegada a la
 * izquierda y apila abajo "Jugador — Categoría" y "Moroso", y la fila de "Mis
 * chicos", donde en un teléfono la píldora comparte renglón con la foto, el
 * nombre y la flecha (una de "Membresía vigente" mide unos 130 px y le deja al
 * nombre menos de 100 px, o sea tres renglones).
 *
 * Su par es "Vencida" y no "Vencido": el femenino es de la membresía, y es lo
 * que la ata a su rótulo cuando el rótulo no está en la misma línea.
 */
export const membershipBadgeLabel = (isActive: boolean): 'Vigente' | 'Vencida' =>
    isActive ? 'Vigente' : 'Vencida'
