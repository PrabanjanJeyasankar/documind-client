import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, VoiceRecording, ChatMessageStatus, VoiceRecordingStatus } from '@/types'

interface PatientMessagesState {
  chatMessages: Record<string, ChatMessage[]>
  voiceRecordings: Record<string, VoiceRecording[]>
  setChatMessages: (patientId: string, messages: ChatMessage[]) => void
  addChatMessage: (patientId: string, msg: ChatMessage) => void
  updateChatMessageStatus: (patientId: string, msgId: string, status: ChatMessageStatus) => void
  setVoiceRecordings: (
    patientId: string,
    updater: VoiceRecording[] | ((prev: VoiceRecording[] | undefined) => VoiceRecording[])
  ) => void
  addVoiceRecording: (patientId: string, recording: VoiceRecording) => void
  updateVoiceRecordingStatus: (patientId: string, recordingId: string, status: VoiceRecordingStatus) => void
}

export const usePatientMessagesStore = create<PatientMessagesState>()(
  persist(
    (set, get) => ({
      chatMessages: {},
      voiceRecordings: {},
      setChatMessages: (patientId, messages) =>
        set((state) => ({
          chatMessages: { ...state.chatMessages, [patientId]: messages },
        })),
      addChatMessage: (patientId, msg) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [patientId]: [...(state.chatMessages[patientId] || []), msg],
          },
        })),
      updateChatMessageStatus: (patientId, msgId, status) =>
        set((state) => ({
          chatMessages: {
            ...state.chatMessages,
            [patientId]: (state.chatMessages[patientId] || []).map((msg) =>
              msg.id === msgId ? { ...msg, status } : msg
            ),
          },
        })),
      setVoiceRecordings: (patientId, updater) =>
        set((state) => {
          const previous = state.voiceRecordings[patientId]
          const newValue =
            typeof updater === 'function'
              ? (updater as (prev: VoiceRecording[] | undefined) => VoiceRecording[])(previous)
              : updater

          return {
            voiceRecordings: {
              ...state.voiceRecordings,
              [patientId]: newValue,
            },
          }
        }),
      addVoiceRecording: (patientId, recording) =>
        set((state) => ({
          voiceRecordings: {
            ...state.voiceRecordings,
            [patientId]: [...(state.voiceRecordings[patientId] || []), recording],
          },
        })),
      updateVoiceRecordingStatus: (patientId, recordingId, status) =>
        set((state) => ({
          voiceRecordings: {
            ...state.voiceRecordings,
            [patientId]: (state.voiceRecordings[patientId] || []).map((rec) =>
              rec.id === recordingId ? { ...rec, status } : rec
            ),
          },
        })),
    }),
    {
      name: 'patient-messages-store-v1',
    }
  )
)
