import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'

import {
    parseGallerySearch,
    parseViewerParam,
    viewerCloseMode,
    viewerOpenState,
    viewerParamValue,
} from '../lib/gallery-url'

/**
 * El filtro y la página del listado, leídos de la URL (ver `gallery-url.ts`
 * por qué viven ahí). Los cambios se hacen con `<Link>`, no desde acá: la
 * única escritura es corregir una página que ya no existe, con `replace` para
 * que el atrás no vuelva a la página rota.
 *
 * `replacePage` es estable (useCallback): la usa un efecto, y con una función
 * nueva en cada render el efecto repetía el `replace` cada vez que llegaba
 * otra cosa (la portada, las categorías) mientras la corrección seguía
 * pendiente.
 */
export const useGallerySearch = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const { categorySlug, page } = parseGallerySearch(searchParams)

    const replacePage = useCallback(
        (nextPage: number) => {
            setSearchParams(
                (previous) => {
                    const params = new URLSearchParams(previous)
                    if (nextPage > 1) params.set('pagina', String(nextPage))
                    else params.delete('pagina')
                    return params
                },
                { replace: true },
            )
        },
        [setSearchParams],
    )

    return { categorySlug, page, replacePage }
}

/**
 * La pantalla completa de un momento, con la URL como única fuente de verdad:
 * el visor está abierto si hay un `?visor=N` válido, y en la foto N.
 *
 * - Abrir con un click AGREGA una entrada al historial. En Android el botón
 *   atrás cierra el visor en vez de sacarte del momento, y como `open` sale de
 *   la URL, cerrarse por el atrás no necesita ningún código aparte.
 * - Pasar de foto REEMPLAZA la entrada: el atrás no recorre las cinco fotos.
 * - Cerrar desde el botón o con Esc: ver `viewerCloseMode`.
 *
 * Todas las escrituras conservan `location.state`: ahí viaja el filtro del
 * listado para "← Galería" (`from`), y perderlo al pasar de foto rompía la
 * vuelta.
 */
export const useMomentViewer = (total: number) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const location = useLocation()
    const navigate = useNavigate()

    const viewerIndex = parseViewerParam(searchParams.get('visor'), total)
    const isOpen = viewerIndex !== null

    // Esc y el botón de cerrar en la misma fracción de segundo mandaban dos
    // `navigate(-1)`: el segundo sacaba a la persona del momento. Hasta que la
    // URL confirma el cierre, cerrar de nuevo no hace nada.
    const closing = useRef(false)
    useEffect(() => {
        if (!isOpen) closing.current = false
    }, [isOpen])

    const withViewer = (index: number | null) => (previous: URLSearchParams) => {
        const params = new URLSearchParams(previous)
        if (index === null) params.delete('visor')
        else params.set('visor', viewerParamValue(index))
        return params
    }

    const openViewer = (index: number) => {
        setSearchParams(withViewer(index), { state: viewerOpenState(location.state) })
    }

    const showPhoto = (index: number) => {
        setSearchParams(withViewer(index), { replace: true, state: location.state })
    }

    const closeViewer = () => {
        if (closing.current) return
        closing.current = true
        if (viewerCloseMode(location.state) === 'back') navigate(-1)
        else setSearchParams(withViewer(null), { replace: true, state: location.state })
    }

    return { viewerIndex, isOpen, openViewer, showPhoto, closeViewer }
}
