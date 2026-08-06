/**
 * Sobre con el que responden TODOS los endpoints (ver ResponseInterceptor en el backend).
 *
 * Ojo con los listados paginados: el interceptor NO anida `{ items, meta }` dentro
 * de `data`. Aplana el resultado — `data` es el array y `meta` queda como hermano:
 *
 *   { success, statusCode, message, data: [...], meta: {...}, timestamp, path }
 */
export interface ApiResponse<T> {
    success: boolean
    statusCode: number
    /** Siempre un string, listo para mostrar. En los errores ya viene en español. */
    message: string
    /**
     * Solo en respuestas de error: el detalle campo por campo de un 400 de
     * validación. En un 400 con varios campos inválidos, `message` trae el
     * primero y acá están todos.
     */
    errors?: string[] | null
    data: T
    meta?: PaginationMeta
    timestamp: string
    path: string
}

export interface PaginationMeta {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
}

/** Respuesta de un listado paginado, ya con `meta` garantizado. */
export type PaginatedResponse<T> = ApiResponse<T[]> & { meta: PaginationMeta }

/** Forma cómoda para consumir en los hooks. */
export interface Paginated<T> {
    items: T[]
    meta: PaginationMeta
}
