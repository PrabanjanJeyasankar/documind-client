import { AiChatMessage } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AiChatStoreState {
  messages: Record<string, AiChatMessage[]>
  addMessage: (patientId: string, message: AiChatMessage) => void
  setMessages: (patientId: string, messages: AiChatMessage[]) => void
  clearMessages: (patientId: string) => void
}

export const useAiChatStore = create<AiChatStoreState>()(
  persist(
    (set) => ({
      messages: {},
      addMessage: (patientId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [patientId]: [...(state.messages[patientId] ?? []), message],
          },
        })),
      setMessages: (patientId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [patientId]: messages,
          },
        })),
      clearMessages: (patientId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [patientId]: [],
          },
        })),
    }),
    {
      name: 'ai-chat-store',
    }
  )
)
