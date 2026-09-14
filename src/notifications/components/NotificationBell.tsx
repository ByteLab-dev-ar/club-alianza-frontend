import { useState } from 'react'
import { Link } from 'react-router'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
    useUnreadCount,
} from '../hooks/useNotifications'
import { notificationMeta } from '../lib/notification-meta'
import type { BellNotice } from '../interfaces/Notification'

/** Arriba de esto el número deja de importar y solo estorba. */
const BADGE_TOPE = 99

const TONE_CLASS = {
    neutral: 'text-muted-foreground',
    positive: 'text-success',
    negative: 'text-destructive',
} as const

/**
 * Una fila del panel.
 *
 * El texto se pinta tal cual viene: `title` y `body` los compone el servidor con
 * el contenido congelado del hecho y el nombre de quien lo recibe. Acá no se
 * arma ninguna frase — `type` solo elige el ícono y el destino.
 */
const NoticeRow = ({ notice, onRead }: { notice: BellNotice; onRead: () => void }) => {
    const meta = notificationMeta(notice.type)
    const Icon = meta.icon
    const isUnread = notice.readAt === null

    const content = (
        <>
            <Icon className={cn('mt-0.5 size-4.5 shrink-0', TONE_CLASS[meta.tone])} />
            <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug font-semibold text-ink">
                    {notice.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {notice.body}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground/70">
                    {formatTimeAgo(notice.at)}
                </span>
            </span>
            {/* El punto es lo único que separa leído de no leído. Va al final y
                ocupa lugar fijo, así las filas no se corren al marcarse. */}
            <span className="mt-1.5 w-2 shrink-0">
                {isUnread && <span className="block size-2 rounded-full bg-secondary" />}
            </span>
        </>
    )

    const className = cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left whitespace-normal',
        !isUnread && 'opacity-70',
    )

    return (
        <DropdownMenuItem
            onSelect={onRead}
            className={className}
            // Sin destino no es un link, pero se sigue pudiendo tocar para
            // marcarlo leído: es la única forma de sacarlo del contador.
            asChild={meta.to !== null}
        >
            {meta.to !== null ? <Link to={meta.to}>{content}</Link> : content}
        </DropdownMenuItem>
    )
}

interface Props {
    /** Para acomodarla al fondo donde se monta (el sidebar es oscuro). */
    className?: string
}

/**
 * La campana del portal (§7.2).
 *
 * **Es una sola para todos.** El personal del club es casi siempre socio —el
 * tesorero tiene su cuota y quizás su grupo familiar—, así que no hay una
 * campana del socio y otra del club: con dos hay que mirar en dos lados, y no
 * queda claro en cuál cae el rechazo del pago propio. Lo que gobierna quién ve
 * qué no es el rol, es a nombre de quién se abrió la entrega.
 *
 * No hay push, ni WebSocket, ni tiempo real: es una decisión escrita del
 * proyecto. Para un club donde el aviso más urgente tolera una hora, el badge
 * se refresca por polling y alcanza.
 *
 * Tampoco hay forma de apagarla, y tampoco es una carencia: del lado del
 * servidor no existe. La única preferencia apaga UN correo (ver el perfil).
 */
export const NotificationBell = ({ className }: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const { data: count } = useUnreadCount()
    // La lista se pide recién al abrir: el badge ya se resuelve con su propio
    // endpoint, que devuelve un número y no cincuenta filas.
    const { data: notices = [], isLoading, isError } = useNotifications(isOpen)

    const markRead = useMarkNotificationRead()
    const markAll = useMarkAllNotificationsRead()

    const unread = count?.unread ?? 0

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
                aria-label={unread > 0 ? `Avisos (${unread} sin leer)` : 'Avisos'}
                className={cn(
                    'relative grid size-10 place-items-center rounded-lg transition-colors outline-none',
                    'focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40',
                    className,
                )}
            >
                <Bell className="size-5" />
                {unread > 0 && (
                    <span className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
                        {unread > BADGE_TOPE ? `${BADGE_TOPE}+` : unread}
                    </span>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-88 p-0">
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <p className="kicker text-muted-foreground">Avisos</p>
                    {unread > 0 && (
                        <button
                            type="button"
                            disabled={markAll.isPending}
                            onClick={() => markAll.mutate()}
                            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                        >
                            {markAll.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <CheckCheck className="size-3.5" />
                            )}
                            Marcar todos
                        </button>
                    )}
                </div>

                <DropdownMenuSeparator className="mx-0 my-0" />

                {/* El listado corta en 50 del lado del servidor y no hay
                    paginación, así que el alto máximo es todo lo que hace falta. */}
                <div className="scroll-slim scroll-slim-light max-h-96 overflow-y-auto p-1">
                    {isLoading && (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            Cargando avisos…
                        </p>
                    )}

                    {isError && (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            No pudimos cargar los avisos. Probá de nuevo en un rato.
                        </p>
                    )}

                    {!isLoading && !isError && notices.length === 0 && (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            No tenés avisos todavía.
                        </p>
                    )}

                    {notices.map((notice) => (
                        <NoticeRow
                            key={notice.id}
                            notice={notice}
                            onRead={() => {
                                // Ya leído no se vuelve a mandar: no existe
                                // "marcar como no leído", así que repetirlo solo
                                // sería una request de más.
                                if (notice.readAt === null) markRead.mutate(notice.id)
                            }}
                        />
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
