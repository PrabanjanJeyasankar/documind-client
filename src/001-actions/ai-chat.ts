// src/actions/ai-chat.ts

import axios from 'axios'

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
    let parsedAnswer = rawAnswer
    let parsedThought = ''

    try {
      const match = rawAnswer.match(/```json\s*([\s\S]+?)\s*```/)
      if (match && match[1]) {
        const json = JSON.parse(match[1])
        parsedAnswer = json.answer ?? rawAnswer
        parsedThought = json.thought ?? ''
      }
    } catch (err) {
      console.error('[PARSE ERROR FROM HISTORY]', err)
    }

    return {
      id: msg.id,
      query: queryLine.replace('Doctor:', '').trim(),
      answer: parsedAnswer,
      thought: parsedThought,
      createdAt: msg.timestamp,
    }
  })
}
