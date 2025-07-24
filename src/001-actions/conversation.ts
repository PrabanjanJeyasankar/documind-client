import axios from 'axios'
import type {
  VoiceRecording,
  VoiceRecordingStatus,
  TranscriptSegment,
  AIMessage,
  ChatMessage,
  ChatMessageInput,
} from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL!

export interface RawVoiceRecording {
  id: string
  url: string
  timestamp: string
  duration?: number
  status?: VoiceRecordingStatus
  fullTranscript?: string
  transcriptSegments?: TranscriptSegment[]
  error?: string
  errorCode?: string
}

export async function fetchVoiceRecordings(patientId: string): Promise<VoiceRecording[]> {
  const { data } = await axios.get<RawVoiceRecording[]>(`${API}/api/conversation/${patientId}/recordings`)
  return data.map((r) => ({
    id: r.id,
    url: r.url.startsWith('http') ? r.url : `${API}${r.url}`,
    timestamp: r.timestamp,
    duration: r.duration,
    status: r.status ?? 'sent',
    fullTranscript: r.fullTranscript,
    transcriptSegments: r.transcriptSegments,
    errorCode: r.errorCode ?? (r.error?.includes('no speech') ? 'no_speech_detected' : undefined),
  }))
}

export async function sendVoiceRecording(
  patientId: string,
  doctorId: string,
  audio: Blob,
  timestamp: string
): Promise<VoiceRecording> {
  const form = new FormData()
  form.append('patientId', patientId)
  form.append('doctorId', doctorId)
  form.append('inputMode', 'voice')
  form.append('conversationType', 'doctor_only')
  form.append('file', audio, 'note.webm')
  form.append('timestamp', timestamp)

  const res = await fetch(`${API}/api/conversation/gemini`, { method: 'POST', body: form })
  if (!res.ok) throw res
  console.log(res)

  const all = await fetchVoiceRecordings(patientId)
  return all.find((r) => r.timestamp === timestamp) ?? all[all.length - 1]
}

export async function fetchChatMessages(id: string): Promise<ChatMessage[]> {
  const { data } = await axios.get<ChatMessage[]>(`${API}/api/conversation/${id}/messages`)
  return data
}
export async function sendChatMessage(inp: ChatMessageInput): Promise<ChatMessage> {
  const f = new FormData()
  f.append('patientId', inp.patientId)
  f.append('doctorId', inp.doctorId)
  f.append('inputMode', 'text')
  f.append('conversationType', inp.conversationType)
  f.append('fullTranscript', inp.fullTranscript)
  const { data } = await axios.post<ChatMessage>(`${API}/api/conversation/`, f)
  return data
}
export async function fetchAIChat(id: string): Promise<AIMessage[]> {
  const { data } = await axios.get<AIMessage[]>(`${API}/api/conversation/${id}/ai`)
  return data
}
