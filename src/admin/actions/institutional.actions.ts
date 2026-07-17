import { clubApi, unwrap } from '@/api/clubApi'
import type { ApiResponse } from '@/api/types'
import type { Board, BoardMember, HistoryMilestone } from '@/institutional/interfaces/Institutional'

// --- Historia (hitos) ---

export interface MilestonePayload {
    year: number
    title: string
    description: string
}

export const createMilestoneAction = async (payload: MilestonePayload) => {
    const response = await clubApi.post<ApiResponse<HistoryMilestone>>('/admin/history', payload)
    return unwrap(response)
}

export const updateMilestoneAction = async (id: string, payload: Partial<MilestonePayload>) => {
    const response = await clubApi.patch<ApiResponse<HistoryMilestone>>(
        `/admin/history/${id}`,
        payload,
    )
    return unwrap(response)
}

export const deleteMilestoneAction = async (id: string) => {
    await clubApi.delete(`/admin/history/${id}`)
}

// --- Comisión directiva ---

/** PUT /admin/board/period — un string vacío limpia el período. */
export const setBoardPeriodAction = async (period: string) => {
    const response = await clubApi.put<ApiResponse<Board>>('/admin/board/period', { period })
    return unwrap(response)
}

export interface BoardMemberPayload {
    position: string
    fullName: string
    displayOrder?: number
}

export const createBoardMemberAction = async (payload: BoardMemberPayload) => {
    const response = await clubApi.post<ApiResponse<BoardMember>>('/admin/board/members', payload)
    return unwrap(response)
}

export const updateBoardMemberAction = async (
    id: string,
    payload: Partial<BoardMemberPayload>,
) => {
    const response = await clubApi.patch<ApiResponse<BoardMember>>(
        `/admin/board/members/${id}`,
        payload,
    )
    return unwrap(response)
}

export const deleteBoardMemberAction = async (id: string) => {
    await clubApi.delete(`/admin/board/members/${id}`)
}
