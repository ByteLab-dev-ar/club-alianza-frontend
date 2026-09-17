import { z } from 'zod'

/**
 * Reglas Zod del formulario de eventos que dependen del contrato del backend.
 *
 * Están acá, y no inline en `EventFormDialog`, porque un schema dentro de un
 * `.tsx` no se puede probar: los specs corren en entorno `node`, sin DOM, y
 * vitest solo toma los `.spec.ts` de `src/`. Mismo patrón que
 * `src/shared/schemas/fields.ts` con su `fields.spec.ts` al lado.
 */

/**
 * Hora del evento: TEXTO LIBRE de hasta 20 caracteres, igual que el backend.
 *
 * La columna es `varchar(20)` nullable y los DTO solo piden
 * `@IsOptional @IsString @MaxLength(20)`: el backend nunca exigió HH:MM. El
 * formulario sí, con un `input type="time"`, y eso dejaba sin editar a los
 * eventos que el club carga mirando el flyer: uno guardado como "De 10 a 18 hs"
 * abría el campo vacío —el input descarta lo que no entiende— y al guardar
 * saltaba "Ingresá la hora en formato HH:MM". No había forma de corregir la
 * hora, de borrarla, ni de guardar ningún otro cambio de ese evento.
 *
 * **El orden de la agenda NO depende de que esto sea HH:MM.** `events.service.ts`
 * ordena por `lpad(substring("event"."time" from '^([0-9]{1,2}:[0-9]{2})'), 5, '0')`:
 * le saca el HH:MM del principio y le rellena el cero solo, así que "9:00"
 * ordena igual que "09:00". Lo que no arranca con una hora ("De 10 a 18 hs",
 * "A confirmar") cae al final de su día, con NULLS LAST. Por eso el formulario
 * guarda lo tipeado tal cual: no hay nada que normalizar, y reescribirle el
 * texto a quien lo cargó no le daría nada a cambio.
 *
 * **El `.trim()` va ANTES del `.max()` y el orden es parte de la regla**, por
 * dos motivos que el test de al lado fija: un campo con puros espacios tiene
 * que quedar en '' —que es cómo el panel borra la hora: el alta lo omite y la
 * edición lo manda vacío para que el `@Transform` de `UpdateClubEventDto` lo
 * convierta en null— en vez de guardarse como una hora en blanco; y dado
 * vuelta, los 20 caracteres del backend se gastarían en espacios.
 */
export const eventTimeField = z.string().trim().max(20, 'Máximo 20 caracteres')
