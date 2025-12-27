// src/actions/ai-chat.ts

import axios from 'axios'
import { parseAiResponse } from '@/utils/ai-response'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export interface SubmitAiQuestionPayload {
  query: string
  doctorId: string
  patientId?: string
}

export interface SubmitAiQuestionResponse {
  thought: string
  answer: string
  conversationId: string
}

export async function submitAiQuestion(payload: SubmitAiQuestionPayload): Promise<SubmitAiQuestionResponse> {
  const response = await axios.post<SubmitAiQuestionResponse>(`${API_URL}/api/qa/semantic-query`, payload)
  return response.data
}

export interface RawAiMessage {
  id: string
  fullTranscript: string
  timestamp: string
}

export async function fetchAiChatMessages(patientId: string) {
  const response = await axios.get<RawAiMessage[]>(`${API_URL}/api/qa/history/${patientId}`)

  return response.data.map((msg) => {
    const [queryLine, answerLine] = msg.fullTranscript.split('\nAI:')
    const rawAnswer = answerLine?.trim() ?? ''
    const parsed = parseAiResponse({ answer: rawAnswer })

    return {
      id: msg.id,
      query: queryLine.replace('Doctor:', '').trim(),
      answer: parsed.answer,
      thought: parsed.thought,
      createdAt: msg.timestamp,
    }
  })
}
