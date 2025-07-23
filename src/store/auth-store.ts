import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Doctor {
  id: string
  name: string
  email: string
  role?: string
  voiceEmbeddingReady?: boolean
}

interface AuthState {
  doctor: Doctor | null
  setDoctor: (doctor: Doctor) => void
  logout: () => void
  updateVoiceEmbeddingReady: (ready: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      doctor: null,
      setDoctor: (doctor: Doctor) => set({ doctor }),
      logout: () => set({ doctor: null }),
      updateVoiceEmbeddingReady: (ready: boolean) =>
        set((state) => (state.doctor ? { doctor: { ...state.doctor, voiceEmbeddingReady: ready } } : state)),
    }),

    {
      name: 'auth-storage',
    }
  )
)
