import { create } from 'zustand'

export interface PendingVoiceRecording {
  id: string
  file: Blob
  url: string
  timestamp: string
  duration: number
  status: 'pending' | 'failed'
  errorCode?: string
}

interface PendingVoiceState {
  pendingRecs: Record<string, PendingVoiceRecording[]>

  addPending: (patientId: string, rec: PendingVoiceRecording) => void
  removePending: (patientId: string, recId: string) => void
  updateStatus: (patientId: string, recId: string, status: 'pending' | 'failed', errorCode?: string) => void
}

export const usePendingVoiceStore = create<PendingVoiceState>((set) => ({
  pendingRecs: {},

  addPending: (patientId, rec) =>
    set((state) => {
      const list = state.pendingRecs[patientId] ?? []
      return {
        pendingRecs: {
          ...state.pendingRecs,
          [patientId]: [...list, rec],
        },
      }
    }),

  removePending: (patientId, recId) =>
    set((state) => {
      const list = state.pendingRecs[patientId] ?? []
      return {
        pendingRecs: {
          ...state.pendingRecs,
          [patientId]: list.filter((r) => r.id !== recId),
        },
      }
    }),

  updateStatus: (patientId, recId, status, errorCode) =>
    set((state) => {
      const list = state.pendingRecs[patientId] ?? []
      return {
        pendingRecs: {
          ...state.pendingRecs,
          [patientId]: list.map((r) => (r.id === recId ? { ...r, status, ...(errorCode ? { errorCode } : {}) } : r)),
        },
      }
    }),
}))
