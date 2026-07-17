import { Outlet } from 'react-router'

import { PublicFooter } from '../components/PublicFooter'
import { PublicHeader } from '../components/PublicHeader'

/** Layout del sitio público: header + contenido + footer. */
export const PublicLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    )
}
