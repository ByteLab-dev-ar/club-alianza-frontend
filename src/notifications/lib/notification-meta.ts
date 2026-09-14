import {
    Bell,
    CalendarClock,
    CircleCheck,
    CircleX,
    FileText,
    Receipt,
    TriangleAlert,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react'

/**
 * Qué ícono le toca a un aviso y a dónde lleva al tocarlo.
 *
 * **Es un mapa con caída, no un `Record` exhaustivo, y esa es toda la gracia.**
 * El catálogo del backend dice textualmente que los tipos "se agregan, no se
 * renombran", y además conserva valores retirados —`PAYMENT_REMINDER`, que ya
 * no se emite pero sigue vivo en las filas viejas— porque borrarlos dejaría
 * avisos históricos que el catálogo no sabe mostrar.
 *
 * O sea: la campana de alguien puede traer hoy un tipo que este archivo no
 * conoce, sea uno viejo o uno que el backend agregó ayer. Con un `Record`
 * cerrado eso es `undefined` y una campana rota. Con caída es una campana
 * genérica que igual muestra el texto, que ya viene armado del servidor y es lo
 * único que la persona necesita leer.
 *
 * Mismo criterio que `paymentConceptLabel` con los conceptos congelados del
 * recibo.
 */
export interface NotificationMeta {
    icon: LucideIcon
    /** A dónde lleva el click, o `null` si no hay a dónde. */
    to: string | null
    /** Tono del ícono. Solo tres, para no convertir la lista en un semáforo. */
    tone: 'neutral' | 'positive' | 'negative'
}

const FALLBACK: NotificationMeta = { icon: Bell, to: null, tone: 'neutral' }

/** Los destinos salen de dónde puede hacer algo la persona, no del tema. */
const PAGOS = '/mi-cuenta/pagos'
const CHICOS = '/mi-cuenta/chicos'
const PERFIL = '/mi-cuenta/perfil'
const PANEL = '/admin'

const META: Record<string, NotificationMeta> = {
    /* ---- Plata ---- */
    PAYMENT_APPROVED: { icon: CircleCheck, to: PAGOS, tone: 'positive' },
    PAYMENT_REJECTED: { icon: CircleX, to: PAGOS, tone: 'negative' },
    // Va con ícono propio y tono neutro: no es un rechazo por algo que la
    // persona hizo mal, es que lo mismo ya se cobró en la sede.
    TRANSFER_SUPERSEDED: { icon: Receipt, to: PAGOS, tone: 'neutral' },
    RECEIPT_VOIDED: { icon: Receipt, to: PAGOS, tone: 'negative' },
    CASH_RECEIPT: { icon: Receipt, to: PAGOS, tone: 'positive' },
    COVERAGE_EXPIRING: { icon: CalendarClock, to: PAGOS, tone: 'neutral' },
    MEMBERSHIP_DELINQUENT: { icon: TriangleAlert, to: PAGOS, tone: 'negative' },
    DELINQUENCY_CLEARED: { icon: CircleCheck, to: PAGOS, tone: 'positive' },
    PRICE_CHANGED: { icon: CalendarClock, to: PAGOS, tone: 'neutral' },
    // Retirado del catálogo, pero las filas viejas lo siguen usando: si alguien
    // no vació su campana, todavía lo tiene ahí.
    PAYMENT_REMINDER: { icon: CalendarClock, to: PAGOS, tone: 'neutral' },

    /* ---- Trámite y familia ---- */
    APPLICATION_APPROVED: { icon: CircleCheck, to: PERFIL, tone: 'positive' },
    APPLICATION_REJECTED: { icon: CircleX, to: PERFIL, tone: 'negative' },
    FAMILY_PROPOSAL_RESOLVED: { icon: Users, to: CHICOS, tone: 'neutral' },
    FAMILY_GROUP_CHANGED: { icon: Users, to: CHICOS, tone: 'neutral' },
    GUARDIAN_INVITE_ACCEPTED: { icon: UserRound, to: CHICOS, tone: 'positive' },
    GUARDIAN_REMOVED: { icon: UserRound, to: CHICOS, tone: 'negative' },
    WARD_ACCOUNT_ELIGIBLE: { icon: UserRound, to: CHICOS, tone: 'neutral' },

    /* ---- Del club: solo le llegan a admin y tesorería ---- */
    DELINQUENCY_RUN_ABORTED: { icon: TriangleAlert, to: PANEL, tone: 'negative' },
    IMPORT_FINISHED: { icon: FileText, to: PANEL, tone: 'neutral' },
}

/** El ícono, el destino y el tono de un aviso. Nunca falla: cae en genérico. */
export const notificationMeta = (type: string): NotificationMeta => META[type] ?? FALLBACK
