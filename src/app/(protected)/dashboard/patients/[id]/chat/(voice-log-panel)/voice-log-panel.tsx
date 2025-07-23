'use client'
import React, { FC, useEffect, useRef, useState, UIEvent } from 'react'

import { toast } from 'sonner'
import { AlertCircle, ArrowDown } from 'lucide-react'

import { usePatientVoiceRecordings, useSendVoiceRecording } from '@/002-hooks/use-conversation'
import { usePatientMessagesStore } from '@/store/patient-message-store'

import { Button } from '@/components/ui/button'
import ClassicLoader from '@/components/classic-loader'
import AudioRecordUploadInput from '@/app/(protected)/dashboard/patients/[id]/chat/(voice-log-panel)/audio-record-upload-input'
import { VoiceMessageBubble } from '@/app/(protected)/dashboard/patients/[id]/chat/(voice-log-panel)/voice-message-bubble'
import { TranscriptList } from '@/app/(protected)/dashboard/patients/[id]/chat/(voice-log-panel)/transcript-list'
import NoVoiceLogCard from '@/app/(protected)/dashboard/patients/[id]/chat/(voice-log-panel)/no-voice-log-card'

import { groupVoiceByDate } from '@/utils/voice-conversation'
import { formatDateHeader } from '@/utils/chat-conversation'

import type { VoiceRecording } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import dynamic from 'next/dynamic'

const VoiceSampleStepperBox = dynamic(
  () => import('@/components/voice-sample-modal/voice-sample-stepper-box').then((mod) => mod.VoiceSampleStepperBox),
  { ssr: false }
)

interface VoicePanelProps {
  patientId: string
  doctorId: string
}

export const VoicePanel: FC<VoicePanelProps> = ({ patientId, doctorId }) => {
  const { data: serverRecs, isLoading } = usePatientVoiceRecordings(patientId)

  const setStore = usePatientMessagesStore((s) => s.setVoiceRecordings)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const storeRecs = usePatientMessagesStore((s) => s.voiceRecordings[patientId]) ?? []
  useEffect(() => {
    console.log('serverRecs:', serverRecs)
    console.log('storeRecs:', storeRecs)
  }, [serverRecs, storeRecs])

  const storageKey = `pending-voice-${patientId}`
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const [isScrolledUp, setIsScrolledUp] = useState(false)

  const doctor = useAuthStore((s) => s.doctor)
  const hasVoiceEmbedding = !!doctor?.voiceEmbeddingReady
  const [showSampleModal, setShowSampleModal] = useState(false)

  const grouped = groupVoiceByDate(storeRecs)
  const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  useEffect(() => {
    if (!hasVoiceEmbedding) {
      setShowSampleModal(true)
    }
  }, [hasVoiceEmbedding])

  useEffect(() => {
    if (!serverRecs) return

    setStore(patientId, (prev) => {
      const existing = prev ?? []
      const serverIds = new Set(serverRecs.map((r) => r.id))
      const filtered = existing.filter((r) => !serverIds.has(r.id))

      return [...filtered, ...serverRecs].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    })
  }, [serverRecs, patientId, setStore])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const isNowAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 300
    const isNowScrolledUp = el.scrollTop > 10

    setAtBottom(isNowAtBottom)
    setIsScrolledUp(isNowScrolledUp)
  }

  const sendMut = useSendVoiceRecording(patientId)

  const handleRecordingComplete = async (audio: Blob) => {
    const id = `optimistic-${Date.now()}`
    const timestamp = new Date().toISOString()
    const duration = await getAudioDuration(audio)
    const blobUrl = URL.createObjectURL(audio)

    setStore(patientId, (prev) => {
      const existing = prev ?? []
      const filtered = existing.filter((r) => r.id !== id)
      return [
        ...filtered,
        {
          id,
          url: blobUrl,
          timestamp,
          duration,
          status: 'pending',
          file: audio,
        },
      ]
    })

    sendMut.mutate(
      { audio, id, timestamp, duration, doctorId },
      {
        onSuccess: (saved) => {
          setStore(patientId, (prev) => (prev ?? []).map((r) => (r.id === id ? { ...saved, status: 'sent' } : r)))
          localStorage.removeItem(storageKey)
          toast.success('Voice note uploaded!')
        },
        onError: async (err) => {
          let errorCode: string | undefined
          let message = 'Upload failed.'

          if (err instanceof Response) {
            try {
              const body = await err.json()
              if (typeof body?.detail === 'object') {
                errorCode = body.detail.code
                message = body.detail.message || message
              }
            } catch {}
          }

          setStore(patientId, (prev) =>
            (prev ?? []).map((r) => (r.id === id ? { ...r, status: 'failed', errorCode } : r))
          )
          localStorage.removeItem(storageKey)
          toast.error(message)
        },
      }
    )
  }

  const retry = (rec: VoiceRecording) => {
    if (!rec.file) return

    setStore(patientId, (prev) =>
      (prev ?? []).map((r) =>
        r.id === rec.id
          ? {
              ...r,
              status: 'pending',
              errorCode: undefined,
            }
          : r
      )
    )

    sendMut.mutate(
      {
        audio: rec.file,
        id: rec.id,
        timestamp: rec.timestamp,
        duration: rec.duration!,
        doctorId,
      },
      {
        onSuccess: (saved) => {
          setStore(patientId, (prev) => (prev ?? []).map((r) => (r.id === rec.id ? { ...saved, status: 'sent' } : r)))
          localStorage.removeItem(storageKey)
          toast.success('Retry succeeded!')
        },
        onError: () => {
          setStore(patientId, (prev) => (prev ?? []).map((r) => (r.id === rec.id ? { ...r, status: 'failed' } : r)))
          toast.error('Retry failed.')
        },
      }
    )
  }

  function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined)
    useEffect(() => {
      ref.current = value
    }, [value])
    return ref.current
  }

  const prevRecs = usePrevious(storeRecs)

  useEffect(() => {
    if (!prevRecs) return

    const prevIds = new Set(prevRecs.map((r) => r.id))
    const hasNewRecording = storeRecs.some((r) => !prevIds.has(r.id))

    const hasNewTranscript = storeRecs.some((rec) => {
      const prev = prevRecs.find((p) => p.id === rec.id)
      if (!prev) return false
      return (
        (rec.fullTranscript && rec.fullTranscript !== prev.fullTranscript) ||
        (rec.transcriptSegments?.length || 0) > (prev.transcriptSegments?.length || 0)
      )
    })

    if (hasNewRecording || hasNewTranscript) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [storeRecs, prevRecs])

  return (
    <div className='relative flex flex-col h-full min-h-0 bg-background rounded-lg border'>
      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto p-4 space-y-3'>
        {storeRecs.length === 0 ? (
          isLoading ? (
            <div className='flex justify-center py-6'>
              <ClassicLoader className='w-5 h-5' />
            </div>
          ) : (
            <NoVoiceLogCard />
          )
        ) : (
          dates.map((dateStr) => (
            <div key={dateStr}>
              <div className='flex justify-center mb-2'>
                <span className='text-xs font-mono bg-muted px-3 py-1 rounded-xl'>{formatDateHeader(dateStr)}</span>
              </div>
              {grouped[dateStr].map((rec: VoiceRecording) => (
                <div key={rec.id} className='space-y-2'>
                  <VoiceMessageBubble rec={rec} onRetry={retry} />

                  {rec.transcriptSegments && rec.transcriptSegments.length > 0 ? (
                    <div className='flex flex-col items-start px-4'>
                      <div className='text-[10px] font-mono text-muted-foreground uppercase mb-1'>Transcript</div>
                      <div className='bg-secondary text-secondary-foreground font-sans p-3 rounded-2xl rounded-tl-none w-fit max-w-[80%]'>
                        <TranscriptList segments={rec.transcriptSegments} />
                      </div>
                    </div>
                  ) : rec.fullTranscript ? (
                    <div className='flex flex-col items-start px-4'>
                      <div className='text-[10px] font-mono text-muted-foreground uppercase mb-1'>Full Transcript</div>
                      <div className='bg-secondary text-secondary-foreground font-sans p-3 rounded-2xl rounded-tl-none w-fit max-w-[80%]'>
                        {rec.fullTranscript}
                      </div>
                    </div>
                  ) : rec.errorCode === 'no_speech_detected' ? (
                    <div className='flex flex-col items-start px-4'>
                      <div className='text-[10px] font-mono text-destructive uppercase mb-1'>No Voice Detected !</div>
                      <div
                        className='flex items-center gap-2 font-sans p-3 rounded-2xl rounded-tl-none w-fit max-w-[80%] italic text-destructive bg-destructive/10'
                        role='alert'
                        aria-live='polite'>
                        <AlertCircle className='w-5 h-5 flex-shrink-0 text-destructive' />
                        <span>
                          We couldn&apos;t detect any clear speech in this voice note — it happens! Feel free to try
                          again when ready.
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ))
        )}

        <div ref={endRef} />
      </div>

      {!atBottom && (
        <Button
          type='button'
          variant='outline'
          onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className='absolute left-0 right-0 mx-auto bottom-36 w-10 h-10 rounded-full'>
          <ArrowDown className='w-5 h-5' />
        </Button>
      )}

      <div className='flex justify-center pb-4'>
        <AudioRecordUploadInput onRecordingComplete={handleRecordingComplete} showTopGradient={isScrolledUp} />
      </div>

      {showSampleModal && doctor?.id && (
        <VoiceSampleStepperBox
          doctorId={doctor.id}
          isOpen={showSampleModal}
          onClose={() => setShowSampleModal(false)}
          onUploadSuccess={() => setShowSampleModal(false)}
        />
      )}
    </div>
  )
}

async function getAudioDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      resolve(audio.duration || 0)
      URL.revokeObjectURL(audio.src)
    }
  })
}
