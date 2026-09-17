import {
    Banknote,
    CalendarDays,
    HandCoins,
    Images,
    Inbox,
    LayoutDashboard,
    MailWarning,
    QrCode,
    Receipt,
    ScanLine,
    ScrollText,
    ShieldCheck,
    Users,
    UsersRound,
    Landmark,
    type LucideIcon,
} from 'lucide-react'

import { Roles, type Role } from '@/constants/roles'

/**
 * Las secciones que pueden mostrar un número al lado del rótulo.
 *
 * Es una **clave**, no el número: el menú declara *qué* contador quiere y
 * `useAdminNavBadges` es el único que sabe de dónde sale cada uno. Sin esta
 * vuelta, el primer contador se resolvía con un `if` adentro del sidebar y el
 * segundo con otro, y el menú dejaba de estar declarado en un solo lugar —que
 * es la razón de ser de este archivo.
 *
 * Agregar una unión de un solo valor se ve exagerado hoy; deja de verse así con
 * DEC-12, que suma los cuatro pendientes de `/admin/pending-work`.
 */
export type AdminNavBadge = 'familyGroupSuggestions'

export interface AdminNavItem {
    to: string
    label: string
    icon: LucideIcon
    /** Basta con tener uno de estos roles para ver la sección. */
    allowed: Role[]
    /** `end` para que el índice no quede activo en las subrutas. */
    end?: boolean
    /** Qué contador dibujar a la derecha del rótulo. Sin esto, ninguno. */
    badge?: AdminNavBadge
}

export interface AdminNavGroup {
    /** `null` = va suelto arriba de todo, sin rótulo. Solo el resumen. */
    label: string | null
    items: AdminNavItem[]
}

/**
 * Las secciones del panel, agrupadas por **el trabajo que resuelven**.
 *
 * Con el núcleo construido pasaron de siete a trece, y una lista plana de trece
 * ítems deja de ser un menú: hay que leerla entera para encontrar algo. Los
 * grupos no son decoración — son la respuesta a "¿dónde busco esto?", y por eso
 * salen de la tarea y no de a qué endpoint le pegan:
 *
 * - **Padrón**: quiénes son del club y cómo se agrupan.
 * - **Cobros**: todo lo que mueve plata, en el orden en que se usa (revisar lo
 *   que entró, cobrar en la sede, verificar un papel, y los precios detrás).
 * - **Contenido**: lo que se publica en el sitio.
 * - **Sistema**: quién administra y qué quedó registrado.
 *
 * Los grupos también le dan forma a lo que ve cada rol: tesorería ve
 * prácticamente solo "Cobros", y `web_admin` solo "Contenido". Un grupo sin
 * ítems visibles no se dibuja (ver `visibleGroups`).
 *
 * Es la fuente única: la usan el sidebar (qué mostrar) y `AdminIndex` (a dónde
 * mandar a quien entra a /admin), con el mismo criterio de roles.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
    {
        label: null,
        items: [
            {
                to: '/admin',
                label: 'Resumen',
                icon: LayoutDashboard,
                allowed: [Roles.ADMIN, Roles.ACCOUNTANT],
                end: true,
            },
        ],
    },
    {
        label: 'Padrón',
        items: [
            { to: '/admin/socios', label: 'Socios', icon: Users, allowed: [Roles.ADMIN] },
            // Aparte del padrón a propósito: son los que todavía NO son socios, y
            // aprobar es decidir quién entra. Sin tesorería.
            { to: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox, allowed: [Roles.ADMIN] },
            // Solo ADMIN: armar una familia es lo que decide quién paga la
            // actividad a mitad de precio, y eso es una decisión de membresía,
            // no de mostrador. Por eso vive acá y no en Cobros.
            //
            // El único ítem con contador por ahora (DEC-2): las sugerencias de
            // grupo no se avisaban en ningún lado, y eran lo único del panel que
            // había que ir a buscar a mano para enterarse de que existía.
            {
                to: '/admin/grupos-familiares',
                label: 'Grupos familiares',
                icon: UsersRound,
                allowed: [Roles.ADMIN],
                badge: 'familyGroupSuggestions',
            },
        ],
    },
    {
        label: 'Cobros',
        items: [
            {
                to: '/admin/pagos',
                label: 'Pagos',
                icon: Receipt,
                allowed: [Roles.ADMIN, Roles.ACCOUNTANT],
            },
            // El mismo carrito, operado por tesorería. Recepción NO entra —
            // escanear credenciales es otra función.
            {
                to: '/admin/mostrador',
                label: 'Mostrador',
                icon: Banknote,
                allowed: [Roles.ADMIN, Roles.ACCOUNTANT],
            },
            {
                to: '/admin/verificar-recibo',
                label: 'Verificar recibo',
                icon: QrCode,
                allowed: [Roles.ADMIN, Roles.ACCOUNTANT],
            },
            // Los montos los configuran ADMIN y tesorería: sin esto el club
            // depende de un desarrollador para cada aumento.
            {
                to: '/admin/montos',
                label: 'Montos',
                icon: HandCoins,
                allowed: [Roles.ADMIN, Roles.ACCOUNTANT],
            },
        ],
    },
    {
        label: 'Contenido',
        items: [
            {
                to: '/admin/eventos',
                label: 'Eventos',
                icon: CalendarDays,
                allowed: [Roles.ADMIN, Roles.WEB_ADMIN],
            },
            {
                to: '/admin/galeria',
                label: 'Galería',
                icon: Images,
                allowed: [Roles.ADMIN, Roles.WEB_ADMIN],
            },
            {
                to: '/admin/institucional',
                label: 'Institucional',
                icon: Landmark,
                allowed: [Roles.ADMIN, Roles.WEB_ADMIN],
            },
        ],
    },
    {
        label: 'Sistema',
        items: [
            {
                to: '/admin/staff',
                label: 'Administradores',
                icon: ShieldCheck,
                allowed: [Roles.ADMIN],
            },
            { to: '/admin/auditoria', label: 'Auditoría', icon: ScrollText, allowed: [Roles.ADMIN] },
            // Solo ADMIN, igual que el endpoint: la lista dice el nombre y el
            // número de socio de cada persona a la que no se le pudo escribir.
            // Es información del padrón, no de tesorería.
            {
                to: '/admin/sin-contacto',
                label: 'Sin contacto',
                icon: MailWarning,
                allowed: [Roles.ADMIN],
            },
            // Único ítem que SALE del panel: el escáner es una pantalla propia,
            // sin sidebar, para usar parado en la puerta. Va acá igual para que
            // el admin —que puede escanear— tenga cómo llegar sin tipear la URL.
            {
                to: '/puerta',
                label: 'Escanear credencial',
                icon: ScanLine,
                allowed: [Roles.ADMIN],
            },
        ],
    },
]

/**
 * Las mismas secciones en una lista plana, en el orden del menú.
 *
 * La usa `AdminIndex` para elegir a dónde mandar a quien entra a `/admin` sin
 * poder ver el resumen: agarra la primera que su rol le permite, y el orden de
 * los grupos ya expresa qué es más importante para cada uno.
 */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

/** Los grupos que le quedan a un rol, sin los que perdieron todos sus ítems. */
export const visibleGroups = (canSee: (item: AdminNavItem) => boolean): AdminNavGroup[] =>
    ADMIN_NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter(canSee) })).filter(
        (group) => group.items.length > 0,
    )
