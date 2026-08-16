import type { MemberSex } from './MemberProfile'

/**
 * El alta de un menor a cargo (§2.2).
 *
 * El chico queda como socio COMPLETO sin cuenta: va a tener su ficha, su
 * número y su credencial cuando el club lo apruebe. Lo único que no tiene es
 * con qué entrar, hasta los 16.
 *
 * No se le pide correo: los avisos que le corresponden le llegan a sus tutores.
 */
export interface CreateWardPayload {
    name: string
    surname: string
    /**
     * Obligatoria. De ella salen la categoría si juega y si corresponde
     * afiliarlo como tutelado.
     */
    bornDate: string
    cuil?: string
    dni?: string
    sex?: MemberSex
    phone?: string
    address?: string
    /**
     * Si el chico va a jugar. Es una de las dos excepciones a "solo el club
     * marca jugador", y se permite porque es una carga sobre otra persona y no
     * una auto-asignación.
     */
    isPlayer?: boolean
    /**
     * **Tiene que viajar en `true`.** Es el momento en que el adulto asume la
     * obligación de la cuota del chico, así que en pantalla va como una
     * aceptación explícita y con el texto a la vista — nunca letra chica. Un
     * menor se obliga a través de su representante: quien contrae la deuda es
     * el tutor.
     */
    acceptsPaymentResponsibility: boolean
}

/** Una invitación de tutor que mandé y todavía nadie aceptó ni venció. */
export interface GuardianInvitation {
    id: string
    email: string
    /**
     * Vence a las 72 horas. Que venza no cuesta nada —volver a invitar es un
     * click—; lo que no puede es quedar viva para siempre una invitación a
     * hacerse cargo de una deuda.
     */
    expiresAt: string
}

/** Lo que ve quien abre el link, ANTES de aceptar. Público y sin sesión. */
export interface GuardianInvitationPreview {
    /** Quién invita, solo el nombre de pila. */
    inviterName: string
    /** De qué chicos sería tutor. Nombres de pila, lo mínimo para reconocerlos. */
    wardNames: string[]
    expiresAt: string
}

export interface InviteGuardianPayload {
    email: string
    /**
     * Explícito y no "todos los míos": una madre con dos hijos puede querer
     * sumar al padre a uno solo.
     */
    wardProfileIds: string[]
}
