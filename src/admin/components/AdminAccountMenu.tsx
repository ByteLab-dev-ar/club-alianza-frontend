import { Link } from 'react-router'
import { ArrowLeft, ChevronDown, ChevronUp, LogOut, Moon, Sun, User } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/auth/store/auth.store'
import { useThemeStore } from '@/lib/theme.store'
import { cn } from '@/lib/utils'

interface Props {
    /** En mobile el sidebar es un drawer; al navegar se cierra. */
    onNavigate?: () => void
    /**
     * En la banda superior va compacto: solo el avatar y la flecha.
     *
     * El correo no entra en una fila de 44px junto a la sección, y tampoco hace
     * falta — arriba a la derecha no hay otra cosa que pueda ser. En el pie del
     * sidebar sí se muestra, que es donde alguien va a mirar para confirmar con
     * qué cuenta entró.
     */
    compact?: boolean
}

/**
 * El menú de cuenta: quién sos, a dónde podés ir y cómo salir.
 *
 * Se extrajo del pie de `AdminSidebar` cuando el panel ganó su banda superior
 * (rediseño 09/2026, dirección "Doble piso"): **el mismo menú se monta en dos
 * lugares excluyentes**, arriba en escritorio y en el pie del drawer en mobile,
 * porque en mobile la banda no tiene lugar y el drawer sigue siendo el único
 * sitio donde cerrar sesión.
 */
export const AdminAccountMenu = ({ onNavigate, compact = false }: Props) => {
    const user = useAuthStore((state) => state.user)
    const logoutUser = useAuthStore((state) => state.logoutUser)
    const theme = useThemeStore((state) => state.theme)
    const toggleTheme = useThemeStore((state) => state.toggleTheme)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    'flex items-center rounded-lg text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40 data-[state=open]:bg-sidebar-accent',
                    compact ? 'gap-1.5 p-1.5' : 'w-full gap-2.5 px-2.5 py-2',
                )}
                aria-label={compact ? 'Menú de cuenta' : undefined}
            >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sidebar-foreground">
                    <User className="size-4" />
                </span>

                {!compact && (
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground/70">
                        {user?.email}
                    </span>
                )}

                {/* La flecha apunta a donde va a abrirse: abajo desde la banda,
                    arriba desde el pie del sidebar. */}
                {compact ? (
                    <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/50" />
                ) : (
                    <ChevronUp className="size-4 shrink-0 text-sidebar-foreground/50" />
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side={compact ? 'bottom' : 'top'}
                align="end"
                className="w-56"
            >
                {/* En la banda el correo no está en el disparador, así que se
                    muestra acá: sigue siendo la respuesta a "¿con qué cuenta
                    entré?", solo que a un clic. */}
                {compact && user?.email && (
                    <>
                        <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">
                            {user.email}
                        </p>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Contraparte del link "Panel admin" del portal del socio.
                    Va sin chequeo: /mi-cuenta solo pide sesión, y su índice
                    ya redirige a "Mi perfil" a quien no es socio del club
                    (ver MemberRoutes). O sea que este link siempre lleva a
                    algo que la persona puede usar, sea socia o no. */}
                <DropdownMenuItem asChild>
                    <Link to="/mi-cuenta" onClick={onNavigate}>
                        <User />
                        Mi cuenta
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/" onClick={onNavigate}>
                        <ArrowLeft />
                        Volver al sitio
                    </Link>
                </DropdownMenuItem>

                {/* `preventDefault`: que el menú NO se cierre al togglear — el
                    cambio se ve en el acto y la persona decide si queda o
                    vuelve, sin reabrir nada. */}
                <DropdownMenuItem
                    onSelect={(event) => {
                        event.preventDefault()
                        toggleTheme()
                    }}
                >
                    {theme === 'dark' ? <Sun /> : <Moon />}
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onSelect={() => void logoutUser()}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                    <LogOut />
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
