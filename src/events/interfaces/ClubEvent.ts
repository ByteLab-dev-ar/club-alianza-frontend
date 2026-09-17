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
     * No siempre es una hora: el backend acepta cualquier texto de hasta 20
     * ("De 10 a 18 hs", "A confirmar"). Se muestra con `formatEventTime`, nunca
     * pegándole " hs": así salía "De 10 a 18 hs hs".
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
    /**
     * `asc` si no se manda. `desc` invierte la fecha y la hora juntas, con el
     * mismo desempate del servidor: lo que no empieza con una hora ("A
     * confirmar") queda al final de su día en las dos direcciones.
     */
    order?: 'asc' | 'desc'
}
