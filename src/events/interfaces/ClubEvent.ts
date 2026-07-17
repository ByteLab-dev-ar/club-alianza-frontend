/** `EventCategoryResponseDto` del backend. */
export interface EventCategory {
    id: string
    name: string
    color: string
    createdAt: string
}

/** `ClubEventResponseDto` del backend. */
export interface ClubEvent {
    id: string
    title: string
    description: string | null
    /** ISO date (`YYYY-MM-DD`). */
    date: string
    /** Hora libre, ej. "16:00". Va separada de la fecha. */
    time: string
    location: string
    imageUrl: string | null
    category: EventCategory | null
    createdAt: string
}

export interface EventsQuery {
    page?: number
    limit?: number
    categoryId?: string
    startDate?: string
    endDate?: string
}
