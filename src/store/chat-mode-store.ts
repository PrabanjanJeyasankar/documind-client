import { create } from 'zustand'

type ChatMode = 'voice' | 'text'

export const useChatModeStore = create<{
  mode: ChatMode
  setMode: (mode: ChatMode) => void
}>((set) => ({
  mode: 'voice',
  setMode: (mode) => set({ mode }),
}))
