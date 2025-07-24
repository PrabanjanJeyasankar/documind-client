import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchChatMessages,
  sendChatMessage,
  fetchVoiceRecordings,
  sendVoiceRecording,
} from '@/001-actions/conversation'
import type { ChatMessage, ChatMessageInput, VoiceRecording } from '@/types'

interface OptimisticChatContext {
  previousMessages: ChatMessage[]
  optimisticId: string
}

export function usePatientChat(patientId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ['patientChat', patientId],
    queryFn: () => fetchChatMessages(patientId),
    enabled: Boolean(patientId),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  })
}

type ChatMutationVariables = ChatMessageInput & {
  optimisticId?: string
}

export function useSendPatientChat(patientId: string) {
  const client = useQueryClient()

  return useMutation<ChatMessage, Error, ChatMutationVariables, OptimisticChatContext>({
    mutationFn: sendChatMessage,

    onMutate: async (newMsg: ChatMessageInput & { optimisticId?: string; onOptimisticSend?: () => void }) => {
      await client.cancelQueries({ queryKey: ['patientChat', patientId] })

      const previousMessages = client.getQueryData<ChatMessage[]>(['patientChat', patientId]) ?? []
      const optimisticId = newMsg.optimisticId ?? `optimistic-${Date.now()}`

      const optimisticMsg: ChatMessage = {
        id: optimisticId,
        ...newMsg,
        timestamp: new Date().toISOString(),
        status: 'pending',
      }

      client.setQueryData<ChatMessage[]>(['patientChat', patientId], (prev) => {
        const existing = prev ?? []
        const alreadyExists = existing.some((m) => m.id === optimisticId)

        if (alreadyExists) {
          return existing.map((m) => (m.id === optimisticId ? optimisticMsg : m))
        }

        return [...existing, optimisticMsg]
      })

      return { previousMessages, optimisticId }
    },
    onError: (error: Error, newMsg: ChatMessageInput, context?: OptimisticChatContext) => {
      if (!context) return

      client.setQueryData<ChatMessage[]>(['patientChat', patientId], (old) => {
        if (!old) return []

        return old.map((msg) =>
          msg.id === context.optimisticId
            ? {
                ...msg,
                status: 'failed',
              }
            : msg
        )
      })
    },
    onSuccess: (data: ChatMessage, _vars: ChatMessageInput, context?: OptimisticChatContext) => {
      if (context) {
        const all = client.getQueryData<ChatMessage[]>(['patientChat', patientId]) ?? []
        client.setQueryData<ChatMessage[]>(
          ['patientChat', patientId],
          all.map((m) => (m.id === context.optimisticId ? { ...data, status: 'sent' } : m))
        )
      } else {
        client.invalidateQueries({ queryKey: ['patientChat', patientId] })
      }
    },
  })
}

export function usePatientVoiceRecordings(patientId: string) {
  return useQuery<VoiceRecording[]>({
    queryKey: ['patientVoice', patientId],
    queryFn: async () => {
      console.log('Fetching voice recordings for patientId:', patientId)
      const data = await fetchVoiceRecordings(patientId)
      console.log('Fetched voice recordings:', data)
      return data
    },
    enabled: Boolean(patientId),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

interface SendVoiceRecordingVariables {
  audio: Blob
  id: string
  timestamp: string
  duration: number
  doctorId: string
}

export function useSendVoiceRecording(patientId: string) {
  return useMutation<VoiceRecording, Error, SendVoiceRecordingVariables>({
    mutationFn: ({ audio, doctorId, timestamp }) => sendVoiceRecording(patientId, doctorId, audio, timestamp),
  })
}
