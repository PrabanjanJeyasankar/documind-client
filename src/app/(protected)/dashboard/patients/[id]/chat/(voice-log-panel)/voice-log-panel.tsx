'use client'

import React, { FC, useEffect, useRef, useState, UIEvent } from 'react'
import { AlertCircle, ArrowDown } from 'lucide-react'
import { usePatientVoiceRecordings, useSendVoiceRecording } from '@/002-hooks/use-conversation'
import type { DisplayRecording } from '@/types'
import { PendingVoiceRecording, usePendingVoiceStore } from '@/store/pending-voice-store'
import ClassicLoader from '@/components/classic-loader'
import AudioRecordUploadInput from './audio-record-upload-input'
import { VoiceMessageBubble } from './voice-message-bubble'
import { TranscriptList } from './transcript-list'
import NoVoiceLogCard from './no-voice-log-card'
import { groupVoiceByDate } from '@/utils/voice-conversation'
import { formatDateHeader } from '@/utils/chat-conversation'
import { Button } from '@/components/ui/button'

const NO_PENDING: PendingVoiceRecording[] = []
interface VoicePanelProps {
  patientId: string
  doctorId: string
}

export const VoicePanel: FC<VoicePanelProps> = ({ patientId, doctorId }) => {
  const { data: serverRecs = [], isLoading, refetch } = usePatientVoiceRecordings(patientId)
  const rawPending = usePendingVoiceStore((s) => s.pendingRecs[patientId])
  const pendingRecs = rawPending ?? NO_PENDING

  const { addPending, removePending, updateStatus } = usePendingVoiceStore.getState()

  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  useEffect(() => {
    if (atBottom) {
      endRef.current?.scrollIntoView({ behavior: 'auto' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverRecs.length, pendingRecs.length])

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 300)
    setIsScrolledUp(el.scrollTop > 10)
  }

  const sendMut = useSendVoiceRecording(patientId)

  const handleRecordingComplete = async (audio: Blob) => {
    const id = `pending-${Date.now()}`
    const timestamp = new Date().toISOString()
    const duration = await getAudioDuration(audio)
    const url = URL.createObjectURL(audio)

    addPending(patientId, { id, file: audio, url, timestamp, duration, status: 'pending' })

    sendMut.mutate(
      { audio, id, timestamp, duration, doctorId },
      {
        onSuccess: () => {
          removePending(patientId, id)
          refetch()
        },
        onError: async (err) => {
          let code: string | undefined = undefined
          if (err instanceof Response) {
            try {
              const { detail } = await err.json()
              if (typeof detail === 'string' && detail.includes('No speech')) code = 'no_speech_detected'
            } catch {}
          }
          updateStatus(patientId, id, 'failed', code)
        },
      }
    )
  }

  const retry = (rec: DisplayRecording) => {
    if (!rec.file) return
    updateStatus(patientId, rec.id, 'pending')
    sendMut.mutate(
      { audio: rec.file, id: rec.id, timestamp: rec.timestamp, duration: rec.duration!, doctorId },
      {
        onSuccess: () => {
          removePending(patientId, rec.id)
          refetch()
        },
        onError: () => updateStatus(patientId, rec.id, 'failed'),
      }
    )
  }

  const serverMap = new Map(serverRecs.map((r) => [r.timestamp, r]))
  const display: DisplayRecording[] = [
    ...serverRecs.map((r) => ({
      id: r.id,
      url: r.url,
      timestamp: r.timestamp,
      duration: r.duration,
      status: r.status ?? 'sent',
      fullTranscript: r.fullTranscript,
      transcriptSegments: r.transcriptSegments,
      errorCode: r.errorCode,
    })),
    ...pendingRecs.filter((p) => !serverMap.has(p.timestamp)).map((p) => ({ ...p, file: p.file })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const grouped = groupVoiceByDate(display)
  const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className='relative flex flex-col h-full min-h-0 bg-background rounded-lg border'>
      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto p-4 space-y-3'>
        {display.length === 0 ? (
          isLoading ? (
            <div className='flex justify-center py-6'>
              <ClassicLoader className='w-5 h-5' />
            </div>
          ) : (
            <NoVoiceLogCard />
          )
        ) : (
          dates.map((d) => (
            <React.Fragment key={d}>
              <div className='flex justify-center mb-2'>
                <span className='text-xs font-mono bg-muted px-3 py-1 rounded-xl'>{formatDateHeader(d)}</span>
              </div>
              {grouped[d].map((rec) => (
                <div key={rec.id} className='space-y-2'>
                  <VoiceMessageBubble rec={rec} onRetry={retry} />
                  {rec.transcriptSegments?.length ? (
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
                      <div className='text-[10px] font-mono text-destructive uppercase mb-1'>Transcription Failed</div>
                      <div className='flex items-center gap-2 font-sans p-3 rounded-2xl rounded-tl-none w-fit max-w-[80%] italic text-destructive bg-destructive/10'>
                        <AlertCircle className='w-5 h-5 flex-shrink-0 text-destructive' />
                        <span>We couldn&apos;t detect clear speech—please try a new note.</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </React.Fragment>
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
    </div>
  )
}

async function getAudioDuration(file: Blob): Promise<number> {
  return new Promise((resolve) => {
    const a = document.createElement('audio')
    a.src = URL.createObjectURL(file)
    a.onloadedmetadata = () => {
      resolve(a.duration || 0)
      URL.revokeObjectURL(a.src)
    }
  })
}
