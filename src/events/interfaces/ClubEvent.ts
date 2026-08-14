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
    /**
     * Hora libre, ej. "16:00". Va separada de la fecha.
     *
     * Opcional, igual que `location`: el club sube el flyer de Instagram y ese
     * flyer ya trae impresos la hora y el lugar. Cuando vienen en null, la
     * tarjeta simplemente no muestra la línea.
     */
    time: string | null
    location: string | null
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
