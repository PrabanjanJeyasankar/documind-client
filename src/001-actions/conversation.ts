// src/actions/conversation.ts
import axios from 'axios'
import type {
  ChatMessage,
  ChatMessageInput,
  VoiceRecording,
  VoiceRecordingStatus,
  AIMessage,
  TranscriptSegment,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export interface RawVoiceRecording {
  url: string
  id: string
  audioUrl: string
  timestamp: string
  duration?: number
  status?: VoiceRecordingStatus
  fullTranscript?: string
  transcriptSegments?: TranscriptSegment[]
}

async function getAudioDuration(file: Blob): Promise<number> {
  return new Promise<number>((resolve) => {
    const audio = document.createElement('audio')
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      const raw = audio.duration || 0
      URL.revokeObjectURL(audio.src)
      const safe = Number.isFinite(raw) ? Math.round(raw) : 0
      resolve(safe)
    }
  })
}

export async function sendChatMessage(input: ChatMessageInput): Promise<ChatMessage> {
  const form = new FormData()
  form.append('patientId', input.patientId)
  form.append('doctorId', input.doctorId)
  form.append('inputMode', 'text')
  form.append('conversationType', input.conversationType)
  form.append('fullTranscript', input.fullTranscript)

  const { data } = await axios.post<ChatMessage>(`${API_URL}/api/conversation/`, form)
  return data
}

export async function fetchChatMessages(patientId: string): Promise<ChatMessage[]> {
  const response = await axios.get<ChatMessage[]>(`${API_URL}/api/conversation/${patientId}/messages`)
  return response.data
}

export async function sendVoiceRecording(
  patientId: string,
  doctorId: string,
  audio: Blob,
  timestamp: string
): Promise<VoiceRecording> {
  const duration = await getAudioDuration(audio)

  const form = new FormData()
  form.append('patientId', patientId)
  form.append('doctorId', doctorId)
  form.append('inputMode', 'voice')
  form.append('conversationType', 'doctor_only')
  form.append('file', audio, 'recording.webm')
  form.append('timestamp', timestamp)
  form.append('duration', duration.toString())

  const response = await fetch(`${API_URL}/api/conversation/`, {
    method: 'POST',
    body: form,
  })
  if (!response.ok) {
    throw response
  }

  const raw = (await response.json()) as RawVoiceRecording
  const url = raw.audioUrl.startsWith('http') ? raw.audioUrl : `${API_URL}${raw.audioUrl}`

  return {
    id: raw.id,
    url,
    timestamp: raw.timestamp,
    duration: raw.duration,
    status: raw.status ?? 'sent',
    fullTranscript: raw.fullTranscript,
    transcriptSegments: raw.transcriptSegments,
  }
}

export async function fetchVoiceRecordings(patientId: string): Promise<VoiceRecording[]> {
  const response = await axios.get<RawVoiceRecording[]>(`${API_URL}/api/conversation/${patientId}/recordings`)
  console.log('Raw voice recordings from API:', response.data) // <== add this
  return response.data.map((raw) => ({
    id: raw.id,
    url: raw.url.startsWith('http') ? raw.url : `${API_URL}${raw.url}`,
    timestamp: raw.timestamp,
    duration: raw.duration,
    status: raw.status ?? 'sent',
    fullTranscript: raw.fullTranscript,
    transcriptSegments: raw.transcriptSegments,
  }))
}

export async function fetchAIChat(patientId: string): Promise<AIMessage[]> {
  const response = await axios.get<AIMessage[]>(`${API_URL}/api/conversation/${patientId}/ai`)
  return response.data
}
