import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { reportError } from '@/lib/monitoring'

/**
 * El navegador tira estos mensajes cuando un chunk lazy no se puede bajar. El
 * caso típico no es una falla de red sino un deploy: los archivos con hash
 * viejo dejan de existir y una pestaña abierta desde antes los sigue pidiendo.
 * Ahí recargar alcanza, porque trae el index.html nuevo con los hashes nuevos.
 */
const CHUNK_ERROR_HINTS = [
    'Failed to fetch dynamically imported module',
    'Importing a module script failed',
    'error loading dynamically imported module',
]

const isChunkLoadError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error ?? '')
    return CHUNK_ERROR_HINTS.some((hint) => message.toLowerCase().includes(hint.toLowerCase()))
}

/** Pantalla de error de ruta. Se muestra cuando falla el render de una sección. */
export const RouteErrorPage = () => {
    const error = useRouteError()
    const isOutdatedBuild = isChunkLoadError(error)

    useEffect(() => {
        // El router atrapa el error antes de que llegue a window.onerror, así
        // que sin este reporte explícito el monitoreo nunca se enteraría. El
        // build desactualizado se excluye: no es un bug, es un deploy.
        if (!isOutdatedBuild) reportError(error)
    }, [error, isOutdatedBuild])

    return (
        <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
            <div className="flex flex-col items-center gap-4">
                <h1 className="font-display text-2xl font-extrabold">
                    {isOutdatedBuild ? 'Hay una versión nueva del sitio' : 'Algo salió mal'}
                </h1>
                <p className="max-w-sm text-muted-foreground">
                    {isOutdatedBuild
                        ? 'Esta pestaña quedó con una versión vieja. Recargá para seguir donde estabas.'
                        : 'No pudimos mostrar esta sección. Probá recargar la página.'}
                </p>

                <div className="mt-2 flex flex-wrap justify-center gap-3">
                    <Button variant="dark" onClick={() => window.location.reload()}>
                        Recargar
                    </Button>
                    <Button asChild variant="outline">
                        <Link to="/">Ir al inicio</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
