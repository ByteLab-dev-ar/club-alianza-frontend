import type { DocumentType } from './MemberProfile'

/**
 * Lo que devuelve firmar la ficha en pantalla (§1.4.b).
 *
 * ⚠️ Esto **no es una "firma digital"** y no se le dice así en ninguna
 * pantalla. La ley 25.506 reserva ese término para el certificado de un
 * certificador licenciado; un trazo hecho con el dedo es firma ELECTRÓNICA, y
 * la diferencia es quién prueba: si alguien la desconoce, es el club el que
 * tiene que demostrar que es suya. Por eso el servidor guarda con QUÉ se firmó
 * —estos tres campos, más la IP y el dispositivo— y por eso acá se le dice
 * *ficha firmada*.
 */
export interface SignedAffiliationForm {
    signedAt: string
    /** Qué versión del texto se le mostró al firmar. */
    formVersion: string
    /** SHA-256 del PDF archivado. */
    documentHash: string
}

/**
 * `GET /members/documents` — qué tiene cargado el socio.
 *
 * Sin URL ni bytes a propósito: volver a ver una foto de un documento de
 * identidad es exclusivo del panel. Lo que responde es si está y de cuándo es,
 * que alcanza para saber si conviene reemplazarlo.
 */
export interface MyDocument {
    type: DocumentType
    updatedAt: string
}
