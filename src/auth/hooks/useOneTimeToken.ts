import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Lee el `?token=` de los links que el backend manda por mail (verificación de
 * cuenta, reset de contraseña, confirmación de cambio de email) y lo saca de la
 * barra de direcciones.
 *
 * Por qué sacarlo: son tokens de un solo uso que dan acceso a la cuenta —el de
 * reset permite fijar una contraseña nueva—. Si quedan en la URL terminan en el
 * historial local, en el historial sincronizado del navegador y a la vista de
 * cualquiera que use la misma máquina. El de reset es el peor caso, porque si
 * la persona abre el link y no completa el formulario, queda sin consumir.
 *
 * El valor se captura una sola vez, así que la limpieza posterior de la URL no
 * afecta a quien lo esté usando.
 */
export const useOneTimeToken = (): string => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [token] = useState(() => searchParams.get('token') ?? '')

    useEffect(() => {
        if (!searchParams.has('token')) return

        const withoutToken = new URLSearchParams(searchParams)
        withoutToken.delete('token')
        // `replace` pisa la entrada actual del historial en vez de agregar una:
        // así la URL con el token no queda para atrás.
        setSearchParams(withoutToken, { replace: true })
    }, [searchParams, setSearchParams])

    return token
}
