import { DocumentTypes, MembershipStatuses, type MembershipStatus } from '../interfaces/MemberProfile'

/**
 * Los documentos que el club congela al aprobar la afiliación (§1.6).
 *
 * La ficha de afiliación NO está acá, y la foto de perfil tampoco: el backend
 * las deja fuera de la guarda a propósito —"lo que NO se congela: el domicilio,
 * el teléfono y la foto de perfil"—. Si se las metiera, el socio que vino del
 * padrón histórico se quedaría sin poder cargar la foto que necesita para su
 * credencial ni firmar la ficha que le falta.
 */
const LOCKED_IDENTITY_FIELDS: readonly string[] = [DocumentTypes.DNI_FRONT, DocumentTypes.DNI_BACK]

/**
 * ¿El DNI de este perfil ya está del lado del club?
 *
 * Es distinto del congelamiento de §1.8 (`frozen`), y conviene no confundirlos:
 * aquel es TRANSITORIO —dura mientras la solicitud está en revisión y se levanta
 * cancelándola—, este es DEFINITIVO. Una vez aprobado, reemplazar el documento
 * de identidad pasa por la sede, y el endpoint responde 409 con esa instrucción.
 *
 * Recibe el estado del perfil que se está EDITANDO, que no siempre es el de
 * quien mira la pantalla: un tutor ya socio le carga el DNI a un hijo que
 * todavía no lo es, y ahí el que manda es el estado del chico.
 */
export const isIdentityLocked = (membershipStatus: MembershipStatus | undefined): boolean =>
    membershipStatus === MembershipStatuses.MEMBER

/** ¿Este `field` de `missingRequirements` es uno de los que se congelan? */
export const isLockedIdentityField = (field: string): boolean =>
    LOCKED_IDENTITY_FIELDS.includes(field)
