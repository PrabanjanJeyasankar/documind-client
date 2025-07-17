import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Doctor = {
  id: string
  name: string
  email: string
  role?: string
}

interface AuthState {
  doctor: Doctor | null
  setDoctor: (doctor: Doctor) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      doctor: null,
      setDoctor: (doctor: Doctor) => set({ doctor }),
      logout: () => set({ doctor: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
