import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { SectionLoader } from '@/components/custom/PageLoader'
import { PublicFooter } from '../components/PublicFooter'
import { PublicHeader } from '../components/PublicHeader'

/** Layout del sitio público: header + contenido + footer. */
export const PublicLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1">
                {/* Header y footer quedan fijos mientras una página lazy
                    baja su código. Cuáles lo son lo decide router.app.tsx:
                    hoy Contacto y la página de un momento de la galería. */}
                <Suspense fallback={<SectionLoader />}>
                    <Outlet />
                </Suspense>
            </main>
            <PublicFooter />
        </div>
    )
}
