/**
 * Raíces de las query keys de TanStack Query, en un solo lugar.
 *
 * Antes cada key era un string suelto repetido en varios archivos: las
 * mutaciones de admin invalidaban `['events']` o `['gallery']` re-tipeando a
 * mano keys definidas en otra feature. Renombrar una rompía la invalidación en
 * silencio —sin error de compilación ni de runtime, solo datos viejos en
 * pantalla—. Con el registro acá, un rename es un error de TypeScript.
 *
 * También sirve de frontera: `payments` necesitaba invalidar el perfil del
 * socio e importaba la constante desde `members`, lo que dejaba a las dos
 * features importándose entre sí. Ahora las dos dependen de este módulo.
 *
 * Cada hook compone su key a partir de la raíz (`[QK.events, query]`); acá solo
 * viven las raíces, para que este archivo no dependa de ninguna feature.
 */
export const QK = {
    // ---------------------------------------------------------------- Público
    events: 'events',
    eventCategories: 'event-categories',
    gallery: 'gallery',
    galleryCategories: 'gallery-categories',
    history: 'history',
    board: 'board',
    /** Pantalla pública que abre quien escanea el QR de una credencial. */
    credentialValidation: 'credential-validation',

    // ----------------------------------------------------------- Portal socio
    memberProfile: 'member-profile',
    memberCredential: 'member-credential',
    /** Qué documentos tiene subidos el socio: el tipo y de cuándo son, sin bytes. */
    memberDocuments: 'member-documents',
    /** Los chicos a cargo, y todo lo que cuelga de cada uno. */
    memberWards: 'member-wards',
    /**
     * La ficha de UN tutelado, con `missingRequirements` y
     * `canSubmitApplication`. Raíz propia y no un filtro de `memberWards`: el
     * listado devuelve la ficha SIN el trámite, y son dos respuestas distintas.
     */
    wardProfile: 'ward-profile',
    wardDocuments: 'ward-documents',
    wardCredential: 'ward-credential',
    /** Las invitaciones a segundo tutor que mandó esta cuenta. */
    guardianInvitations: 'guardian-invitations',
    /** La vista pública de una invitación, por token. */
    guardianInvitationPreview: 'guardian-invitation-preview',
    myPayments: 'my-payments',
    /** Qué período de cuota le toca pagar al socio (lo decide el servidor). */
    paymentsNextDue: 'payments-next-due',
    /** A quiénes puede pagarles esta cuenta y qué se le puede pagar a cada uno. */
    paymentsCart: 'payments-cart',
    /**
     * El recibo que emitió el club por un pago. Ojo con el nombre: no es el
     * comprobante que subió quien pagó, que se sirve como bytes y no se cachea.
     */
    paymentReceipt: 'payment-receipt',

    // ------------------------------------------------------------------ Auth
    verifyEmail: 'verify-email',
    confirmEmailChange: 'confirm-email-change',

    // ------------------------------------------------------------ Panel admin
    adminMembers: 'admin-members',
    adminMemberDocuments: 'admin-member-documents',
    /**
     * La bandeja de solicitudes de afiliación. Raíz propia y no un filtro de
     * `adminMembers`: el padrón son los socios, y esto son los que todavía no
     * lo son.
     */
    adminApplications: 'admin-applications',
    adminPayments: 'admin-payments',
    /** El historial y el futuro de los montos de la cuota. */
    adminFees: 'admin-fees',
    /** Los tres montos que rigen hoy. `null` = el club no cargó ese precio. */
    adminCurrentFees: 'admin-current-fees',
    /** La persona parada en el mostrador y los chicos que tiene a cargo. */
    adminCounterPeople: 'admin-counter-people',
    /** Lo que responde el código de verificación de un recibo. */
    adminReceiptVerification: 'admin-receipt-verification',
    adminFamilyGroups: 'admin-family-groups',
    adminFamilyGroupSuggestions: 'admin-family-group-suggestions',
    adminStaff: 'admin-staff',
    adminDashboard: 'admin-dashboard',
    adminAuditLogs: 'admin-audit-logs',
    adminBulkImport: 'admin-bulk-import',
} as const
