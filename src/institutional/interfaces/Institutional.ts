/** `HistoryMilestone` del backend (GET /history, ordenado por año ascendente). */
export interface HistoryMilestone {
    id: string
    year: number
    title: string
    description: string
    createdAt: string
}

/** `BoardMemberResponseDto` del backend. */
export interface BoardMember {
    id: string
    position: string
    fullName: string
    displayOrder: number
    createdAt: string
}

/** `BoardResponseDto`: período vigente + miembros ya ordenados por displayOrder. */
export interface Board {
    period: string | null
    members: BoardMember[]
}
