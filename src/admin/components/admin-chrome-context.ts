import { createContext, useContext } from 'react'

export interface AdminChromeValue {
    /** Dónde la página pone su sección (primer piso). */
    identity: HTMLDivElement | null
    /** Dónde la página pone sus filtros y acciones (segundo piso). */
    page: HTMLDivElement | null
    setIdentity: (element: HTMLDivElement | null) => void
    setPage: (element: HTMLDivElement | null) => void
}

/**
 * Los dos huecos de la banda superior del panel.
 *
 * Vive en su propio archivo y no junto a la barra por una regla del linter que
 * acá tiene razón de fondo: un módulo que exporta componentes Y valores rompe
 * el refresco en caliente. El contexto lo consumen las catorce pantallas; la
 * barra la monta solo el layout.
 *
 * Los valores arrancan en `null` a propósito — los huecos existen recién después
 * del primer render de la barra, y quien los use tiene que contemplarlo.
 */
export const AdminChromeContext = createContext<AdminChromeValue>({
    identity: null,
    page: null,
    setIdentity: () => {},
    setPage: () => {},
})

export const useAdminChrome = () => useContext(AdminChromeContext)
