export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const IMAGE_OR_PDF_TYPES = [...IMAGE_TYPES, 'application/pdf']
export const CSV_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain']

interface Options {
    types?: string[]
    typesLabel?: string
    maxSize?: number
}

/**
 * Chequeo de subida del lado del cliente. Es UX, no seguridad —la barrera real
 * es el backend—, pero evita esperar una subida larga para que termine en un
 * error del servidor.
 *
 * Valida el tipo además del tamaño porque el atributo `accept` del input se
 * saltea eligiendo "Todos los archivos" en el diálogo del sistema.
 *
 * Devuelve el mensaje de error, o `null` si el archivo está bien.
 */
export const validateUpload = (file: File, options: Options = {}): string | null => {
    const {
        types = IMAGE_TYPES,
        typesLabel = 'imágenes JPG, PNG o WebP',
        maxSize = MAX_UPLOAD_SIZE,
    } = options

    if (file.size > maxSize) {
        return `El archivo no puede superar los ${Math.round(maxSize / 1024 / 1024)}MB`
    }

    // Los .csv a veces llegan con type vacío según el sistema operativo, así que
    // ahí se cae a la extensión en vez de rechazar un archivo válido.
    const hasKnownType = file.type.length > 0
    if (hasKnownType && !types.includes(file.type)) {
        return `Solo se aceptan ${typesLabel}`
    }

    return null
}
