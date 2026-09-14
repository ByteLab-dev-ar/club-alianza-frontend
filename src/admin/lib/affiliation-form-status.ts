import { DocumentTypes } from '@/members/interfaces/MemberProfile'
import type { AdminMemberDocument } from '../interfaces/AdminMember'

/**
 * Cómo está firmada la ficha de afiliación de un socio.
 *
 * - `screen`: firmó con el dedo o el mouse. `signedAt` dice cuándo.
 * - `paper`: el club archivó el papel que trajo a la sede. **No tiene fecha de
 *   firma y no es un dato que falte**: el trazo nunca pasó por el sistema.
 * - `missing`: no hay ficha. Es el único caso en el que hay algo para cargar.
 */
export type AffiliationFormStatus =
    | { kind: 'screen'; signedAt: string }
    | { kind: 'paper' }
    | { kind: 'missing' }

/**
 * Qué contestarle a quien está atendiendo al socio y pregunta por la ficha.
 *
 * **El trabajo de esta función es no confundir "en papel" con "sin firmar".**
 * Mirando `signedAt` a secas —que es lo que invita a hacer, porque es el campo
 * que suena a "¿está firmada?"— las dos dan `null` y la ficha traída de la sede
 * se lee como un trámite pendiente: se le pediría al socio que vuelva a firmar
 * algo que ya firmó, y el panel ofrecería subir una ficha que ya está archivada.
 * Lo que separa los casos es la EXISTENCIA del documento, y recién después el
 * `signedVia`.
 *
 * La caída de `signedVia` repite la regla del backend en vez de tirar a
 * `missing`: si un día llega una respuesta sin el campo, una ficha que existe
 * tiene que seguir contando como firmada de alguna de las dos maneras — decir
 * que no hay ficha habilitaría el botón de subir sobre una que sí está.
 */
export const deriveAffiliationFormStatus = (
    documents: AdminMemberDocument[] | undefined,
): AffiliationFormStatus => {
    const form = documents?.find((document) => document.type === DocumentTypes.AFFILIATION_FORM)

    if (!form) return { kind: 'missing' }

    const via = form.signedVia ?? (form.signedAt ? 'screen' : 'paper')

    // Con `screen` la fecha viene siempre; el chequeo es para no escribir
    // "Firmada el null" si alguna vez no viniera.
    if (via === 'screen' && form.signedAt) return { kind: 'screen', signedAt: form.signedAt }

    return { kind: 'paper' }
}
