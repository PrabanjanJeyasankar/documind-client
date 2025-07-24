import type React from 'react'
import type { LucideIcon } from 'lucide-react'

export interface Patient {
  id: string
  externalId?: string | null
  firstName: string
  lastName: string
  fullName?: string | null
  dateOfBirth: string
  gender?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
  bloodType?: string | null
  allergies: string[]
  chronicConditions: string[]
  medicalTags: string[]
  notes?: string | null
  primaryDoctorId: string
  lastVisit?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePatientInput {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  bloodType?: string
  allergies: string[]
  chronicConditions: string[]
  medicalTags: string[]
  notes?: string
  primaryDoctorId: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  passwordHash: string
  role?: string
  voiceEmbedding: number[]
  voiceEmbeddingReady: boolean
  voiceUpdatedAt?: string
}

export type RegisterFieldErrors = {
  name?: string
  email?: string
  password?: string
  form?: string
}

export type LoginFieldErrors = {
  email?: string
  password?: string
  form?: string
}

export interface DashboardTabItem {
  id: string
  title: string
  icon: LucideIcon
  color: string
  href: string
  content?: React.ReactNode
}

export interface TabAnimationConfig {
  duration: number
  ease: string | [number, number, number, number]
  stiffness: number
  damping: number
}

export interface TabDimensions {
  width: number
  left: number
}

export const EMPTY_FORM: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'fullName' | 'lastVisit'> = {
  externalId: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  bloodType: '',
  allergies: [],
  chronicConditions: [],
  medicalTags: [],
  notes: '',
  primaryDoctorId: '',
}

export interface AIMessage {
  id: string
  text: string
  sender: 'ai' | 'doctor'
  timestamp: string
}

export type ChatMessageStatus = 'pending' | 'sent' | 'failed'

export interface ChatMessage {
  id: string
  patientId: string
  doctorId: string
  conversationType: string
  fullTranscript: string
  timestamp: string
  status?: ChatMessageStatus
}

export interface ChatMessageInput {
  patientId: string
  doctorId: string
  conversationType: string
  fullTranscript: string
  onOptimisticSend?: () => void
}

export type VoiceRecordingStatus = 'pending' | 'sent' | 'failed'

export interface TranscriptSegment {
  speaker: string
  text: string
  start: number
  end: number
}

export interface VoiceRecording {
  id: string
  url: string
  timestamp: string
  duration?: number
  status?: VoiceRecordingStatus
  file?: Blob
  fullTranscript?: string
  transcriptSegments?: TranscriptSegment[]
  errorCode?: string
}

export interface AiChatMessage {
  id: string
  query: string
  thought: string
  answer: string
  createdAt: string
}

export interface LocalAiMessage extends AiChatMessage {
  localId: string
  status: 'pending' | 'sent' | 'failed'
  showCot: boolean
  isFromHistory?: boolean
}

export interface DisplayRecording {
  id: string
  url: string
  timestamp: string
  duration?: number
  status: VoiceRecordingStatus | 'pending' | 'failed'
  fullTranscript?: string
  transcriptSegments?: TranscriptSegment[]
  file?: Blob
  errorCode?: string
}
