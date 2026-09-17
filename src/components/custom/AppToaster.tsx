import type { CSSProperties } from 'react'
import { Toaster } from 'sonner'

/*
 * Las variables de sonner, apuntadas a los tokens del sistema.
 *
 * Van por `style` porque el inline le gana a
 * `[data-sonner-toaster][data-sonner-theme='light']`, que es donde sonner las
 * declara, sin pelear especificidad. Y como `var(--popover)` se resuelve contra
 * <html>, el modo oscuro de los paneles llega solo: PanelShell pone `.dark` ahí
 * y los tokens se reapuntan, así que no hay que sincronizar la prop `theme` con
 * el store.
 *
 * `--radius` y NO `--radius-lg`: `--radius-lg` vive en `@theme inline` y
 * Tailwind no lo emite como variable en runtime (no está en el CSS del build).
 * Un var() a una variable que no existe deja el border-radius en 0, medido en
 * maquetas/toaster. `--radius` es el radio lg por definición.
 */
const TOKENS = {
    '--normal-bg': 'var(--popover)',
    '--normal-border': 'var(--border)',
    '--normal-text': 'var(--popover-foreground)',
    '--border-radius': 'var(--radius)',
} as CSSProperties

/**
 * El toaster de la app, adaptado al sistema.
 *
 * Reemplaza al `<Sonner richColors />` de shadcn. `richColors` pintaba cada
 * estado con la paleta propia de sonner (fondos verde y rojo clarito) en vez de
 * los tokens, y seguía claro sobre el panel oscuro. Ahora la superficie es la
 * misma para todos y el estado lo dice el ícono.
 *
 * `expand`: la pila siempre desplegada. Colapsada, sonner esconde el contenido
 * de todo lo que no está al frente, y el aviso de aprobación que no movió el
 * vencimiento (persistente justamente para que no pase desapercibido) quedaba
 * tapado por los "Pago aprobado." que llegan después.
 *
 * El `onMouseDown` es la tercera parte del arreglo de los diálogos (las otras
 * dos: `pointer-events` en index.css y la guarda de dialog.tsx). Con un modal
 * abierto, el mousedown en la X le daba el foco al botón, que queda fuera del
 * diálogo; el FocusScope de Radix lo devolvía al último input con `select()` y
 * la tecla siguiente reemplazaba lo tipeado entero (medido con mouse y teclado
 * reales: un CUIL pasaba a ser "Z"). Sin foco que mover no hay nada que
 * devolver. Click, hover y swipe van por pointer events y siguen andando; lo
 * que se pierde es seleccionar el texto del toast con el mouse.
 *
 * Tipografía, color del ícono por estado, sombra y la X viven en el bloque
 * `.club-toaster` de index.css: sonner no tiene variables para eso, y el
 * `className` de acá es lo que les da especificidad sobre el <style> que sonner
 * inyecta después.
 *
 * Los textos accesibles van en español: los de fábrica son "Notifications" y
 * "Close toast", y los lee el lector de pantalla.
 */
export const AppToaster = () => (
    <div className="contents" onMouseDown={(event) => event.preventDefault()}>
        <Toaster
            position="top-right"
            expand
            closeButton
            className="club-toaster"
            style={TOKENS}
            containerAriaLabel="Avisos"
            toastOptions={{ closeButtonAriaLabel: 'Cerrar aviso' }}
        />
    </div>
)
