/**
 * La galería no son fotos sueltas: son **momentos**.
 *
 * Un momento es un hecho del club —un partido, un torneo, un asado— con hasta 5
 * fotos. El título, la descripción, la fecha y la categoría son del momento; una
 * foto solo tiene su URL y su posición. De ahí salen las dos pantallas públicas:
 * la grilla muestra un momento por tarjeta con su portada, y el detalle muestra
 * todas sus fotos.
 */

/** `GalleryCategoryResponseDto` del backend. */
export interface GalleryCategory {
    id: string
    name: string
    /** Hex `#RRGGBB`, listo para pintar el chip. */
    color: string
    createdAt: string
}

/** Una foto dentro de un momento. No lleva metadatos propios. */
export interface GalleryImage {
    id: string
    imageUrl: string
    displayOrder: number
}

/**
 * Un momento tal como viene en el listado.
 *
 * `images` NO está: el backend no lo manda en la grilla, y por eso son dos tipos
 * en vez de uno con el campo opcional. Con un opcional el tipo miente por
 * omisión y `album.images.length` compila para después explotar en la grilla;
 * con dos tipos, leer las fotos donde no las hay ni siquiera tipa.
 */
export interface GalleryAlbumListItem {
    id: string
    title: string
    description: string | null
    /**
     * Día calendario `"YYYY-MM-DD"`, **no** un ISO con hora ni zona.
     * Pasarlo por `new Date()` lo lee como medianoche UTC y en Argentina
     * muestra el día anterior. Usar `formatCalendarDate` de `@/lib/format`,
     * que parsea en hora local.
     */
    date: string | null
    category: GalleryCategory | null
    /**
     * Primera foto por `displayOrder`. Es `null` mientras el momento no tenga
     * fotos — un estado real y no un borde teórico, porque el panel crea los
     * momentos vacíos y las fotos se suben después. La tarjeta necesita su
     * placeholder.
     */
    coverUrl: string | null
    /** Para que la tarjeta diga "5 fotos" sin traerlas. */
    imageCount: number
    /** ISO completo, este sí. */
    createdAt: string
}

/** Un momento con todas sus fotos, ya ordenadas por `displayOrder`. */
export interface GalleryAlbum extends GalleryAlbumListItem {
    images: GalleryImage[]
}

export interface GalleryQuery {
    page?: number
    limit?: number
    categoryId?: string
}
