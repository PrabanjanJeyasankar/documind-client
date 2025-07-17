import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchAiChatMessages,
  submitAiQuestion,
  SubmitAiQuestionPayload,
  SubmitAiQuestionResponse,
} from '@/actions/ai-chat'
import { AiChatMessage } from '@/types'

export function useSubmitAiQuestion() {
  return useMutation<SubmitAiQuestionResponse, Error, SubmitAiQuestionPayload>({
    mutationFn: submitAiQuestion,
  })
}

export function useAiChatHistory(patientId: string) {
  return useQuery<AiChatMessage[]>({
    queryKey: ['ai-chat', patientId],
    queryFn: () => fetchAiChatMessages(patientId),
    enabled: Boolean(patientId),
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  })
}
