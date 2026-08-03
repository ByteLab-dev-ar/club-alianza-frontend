/// <reference types="vite/client" />

/**
 * Sin esto, `import.meta.env.VITE_API_URL` resuelve por la index signature de
 * ImportMetaEnv y queda tipado `any`: un typo en el nombre compilaba sin error
 * y la baseURL de toda la API quedaba sin tipo.
 *
 * Recordá que TODA variable `VITE_*` termina en el bundle público: acá no va
 * nada secreto.
 */
interface ImportMetaEnv {
    readonly VITE_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
