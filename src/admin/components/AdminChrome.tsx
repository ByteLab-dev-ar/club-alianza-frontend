import { useState, type ReactNode } from 'react'

import { NotificationBell } from '@/notifications/components/NotificationBell'
import { AdminChromeContext, useAdminChrome } from './admin-chrome-context'
import { AdminAccountMenu } from './AdminAccountMenu'

/**
 * Da los dos huecos de la banda a las páginas que están más abajo en el árbol.
 *
 * El problema que resuelve: la banda la monta el layout, pero **quién sabe qué
 * va adentro es cada página**, y las páginas viven dentro del `<Outlet>`, o sea
 * más abajo. Levantar el título y los filtros al layout obligaría a un registro
 * central que hay que mantener sincronizado con catorce pantallas.
 *
 * Con esto cada página sigue declarando lo suyo donde siempre —en su
 * `<AdminPageHeader>`— y ese contenido se dibuja arriba por un portal. Lo que
 * viaja es el nodo del DOM, no los datos: no hay estado que sincronizar, y al
 * desmontarse la página su contenido se va solo de la banda.
 *
 * Va en `useState` y no en `useRef` a propósito: los huecos existen recién
 * después del primer render, y con una ref las páginas nunca se enterarían de
 * que aparecieron.
 */
export const AdminChromeProvider = ({ children }: { children: ReactNode }) => {
    const [identity, setIdentity] = useState<HTMLDivElement | null>(null)
    const [page, setPage] = useState<HTMLDivElement | null>(null)

    return (
        <AdminChromeContext.Provider value={{ identity, page, setIdentity, setPage }}>
            {children}
        </AdminChromeContext.Provider>
    )
}

/**
 * La banda superior del panel: dos pisos, pegada arriba (rediseño 09/2026).
 *
 * **Primer piso, la identidad**: en qué sección estás, los avisos y tu cuenta.
 * Es lo que no cambia entre pantallas. **Segundo piso, la página**: sus filtros
 * y sus acciones — el submenú que antes flotaba sobre el contenido y se perdía
 * al scrollear.
 *
 * Lo que gana el sidebar: la campana y el pie de cuenta se mudaron acá, y eso
 * son ~110px que le devuelven aire a un menú que estaba al límite (con catorce
 * secciones le quedaban 2px en 1080p).
 *
 * `bg-sidebar` y no `bg-card`: es chrome, no contenido, y el sidebar es el único
 * token que NO se invierte con el tema — la banda se ve igual en claro y en
 * oscuro, como el menú al que pertenece.
 */
export const AdminChromeBar = () => {
    const { setIdentity, setPage } = useAdminChrome()

    return (
        <div className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
            {/*
             * Primer piso.
             *
             * `h-18` es el MISMO alto que el bloque de marca del sidebar
             * (AdminSidebar), y eso no es una coincidencia que haya que
             * preservar de memoria: son las dos piezas de chrome que arrancan
             * arriba de todo, y sus bordes inferiores forman una sola línea
             * horizontal que cruza la pantalla. Con 48px acá esa línea se
             * partía en un escalón de 24px que se leía como un error de
             * maquetado.
             *
             * Sirve igual en las pantallas que sí tienen segundo piso: ahí este
             * borde pasa a ser el divisor entre los dos pisos, y cae en la misma
             * línea. Si algún día cambia el alto del bloque de marca, este tiene
             * que cambiar con él.
             *
             * Oculto en mobile: ahí PanelShell ya monta su propia barra con el
             * logo, la campana y el botón del menú, y repetirlo sería robarle a
             * la pantalla chica el alto que la banda vino a ganar.
             */}
            <div className="hidden h-18 items-center gap-4 px-5 sm:px-8 lg:flex">
                <div className="flex min-w-0 items-baseline gap-2.5" ref={setIdentity} />

                <div className="ml-auto flex items-center gap-1">
                    <NotificationBell className="hover:bg-sidebar-accent" />
                    <AdminAccountMenu compact />
                </div>
            </div>

            {/*
             * Segundo piso.
             *
             * `empty:hidden` es lo que lo hace desaparecer en las pantallas sin
             * filtros ni acciones —el resumen, la auditoría—: el hueco existe
             * siempre en el DOM (un portal necesita un destino), pero cuando la
             * página no le manda nada, el navegador lo esconde. Sin esto, esas
             * pantallas cargarían con una franja vacía de 44px.
             *
             * `chrome-band` reapunta los tokens de superficie a los del sidebar,
             * así los botones que cada página ya tiene escritos —un `outline`,
             * un `dark`— se dibujan contra la banda oscura sin que haya que
             * reescribirlos uno por uno (ver index.css).
             */}
            <div
                className="chrome-band flex h-11 items-center gap-3 border-t border-sidebar-border px-5 empty:hidden sm:px-8"
                ref={setPage}
            />
        </div>
    )
}
