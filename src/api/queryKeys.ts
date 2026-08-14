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
    myPayments: 'my-payments',
    /** Qué período de cuota le toca pagar al socio (lo decide el servidor). */
    paymentsNextDue: 'payments-next-due',
    /** A quiénes puede pagarles esta cuenta y qué se le puede pagar a cada uno. */
    paymentsCart: 'payments-cart',

    // ------------------------------------------------------------------ Auth
    verifyEmail: 'verify-email',
    confirmEmailChange: 'confirm-email-change',

    // ------------------------------------------------------------ Panel admin
    adminMembers: 'admin-members',
    adminMemberDocuments: 'admin-member-documents',
    adminPayments: 'admin-payments',
    adminStaff: 'admin-staff',
    adminDashboard: 'admin-dashboard',
    adminAuditLogs: 'admin-audit-logs',
    adminBulkImport: 'admin-bulk-import',
} as const
