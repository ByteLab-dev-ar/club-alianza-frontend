import { create } from 'zustand'

/**
 * El modo oscuro de los PANELES (§ rediseño 09/2026, dirección "Tinta").
 *
 * Es la misma anatomía en dos modos, no otro diseño: la clase `dark` de
 * `index.css` redefine los tokens y todo lo tokenizado se adapta solo. Lo que
 * no debe oscurecerse jamás —el recibo, que es papel, y la credencial, que se
 * exporta como PNG— lleva `.force-light`.
 *
 * La clase la aplica `PanelShell` mientras está montado, así que **el sitio
 * público, el auth y la puerta quedan siempre claros**: esas pantallas están
 * diseñadas alrededor de las fotos del club y del veredicto de alto contraste,
 * y un modo oscuro ahí no es una preferencia, es otro diseño. La preferencia
 * queda guardada y recibe a la persona en su próximo ingreso al panel.
 */

const THEME_STORAGE_KEY = 'panel-theme'

export type PanelTheme = 'light' | 'dark'

const readStoredTheme = (): PanelTheme => {
    // try/catch: en navegación privada con storage bloqueado, `localStorage`
    // puede directamente tirar. Sin preferencia legible, se arranca en claro.
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
    } catch {
        return 'light'
    }
}

interface ThemeState {
    theme: PanelTheme
    toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
    theme: readStoredTheme(),
    toggleTheme: () => {
        const next: PanelTheme = get().theme === 'dark' ? 'light' : 'dark'
        try {
            localStorage.setItem(THEME_STORAGE_KEY, next)
        } catch {
            // Sin storage la preferencia vive lo que viva la pestaña. Suficiente.
        }
        set({ theme: next })
    },
}))
