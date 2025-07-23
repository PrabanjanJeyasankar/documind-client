import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TabType = 'chat' | 'voice' | 'ai'

interface PreferenceStore {
  patientTabs: Record<string, TabType>
  setPatientTab: (patientId: string, tab: TabType) => void
  getPatientTab: (patientId: string) => TabType | undefined
}

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      patientTabs: {},
      setPatientTab: (patientId, tab) =>
        set((state) => ({
          patientTabs: {
            ...state.patientTabs,
            [patientId]: tab,
          },
        })),
      getPatientTab: (patientId) => get().patientTabs[patientId],
    }),
    {
      name: 'user-preferences',
    }
  )
)
