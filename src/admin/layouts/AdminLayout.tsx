import { PanelShell } from '@/components/custom/PanelShell'
import { AdminSidebar } from '../components/AdminSidebar'
import { AdminChromeBar, AdminChromeProvider } from '../components/AdminChrome'

/**
 * El marco del panel, a lo ancho de la pantalla.
 *
 * `contentClassName` existía desde que se extrajo `PanelShell` —su propia prop
 * dice "el panel admin usa tablas más anchas"— y nunca se le pasaba, así que el
 * panel se quedaba con el default de 16rem menos: `max-w-6xl`, 1152px. En una
 * pantalla de 1920 eso deja ~450px vacíos a la derecha MIENTRAS la tabla de
 * pagos scrollea de costado. El portal del socio sí se queda con el default: son
 * fichas y formularios, y una línea de texto de 1600px no se lee.
 *
 * El proveedor envuelve TODO el shell y no solo la banda: la banda ofrece los
 * huecos y las páginas —que viven en el `<Outlet>`, más abajo— los usan. Los dos
 * lados tienen que estar bajo el mismo proveedor.
 */
export const AdminLayout = () => {
    return (
        <AdminChromeProvider>
            <PanelShell
                sidebar={(props) => <AdminSidebar {...props} />}
                banner={<AdminChromeBar />}
                contentClassName="max-w-none"
            />
        </AdminChromeProvider>
    )
}
