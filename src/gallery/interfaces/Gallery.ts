/** `GalleryCategoryResponseDto` del backend. */
export interface GalleryCategory {
    id: string
    name: string
    color: string
    createdAt: string
}

/** `GalleryImageResponseDto` del backend. */
export interface GalleryImage {
    id: string
    title: string
    description: string | null
    /** ISO date o null. */
    date: string | null
    imageUrl: string
    category: GalleryCategory | null
    createdAt: string
}

export interface GalleryQuery {
    page?: number
    limit?: number
    categoryId?: string
}
