// components/voice-sample-modal/voice-sample-stepper.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Mic, X, Loader2, Repeat2, UploadCloud, Square, ArrowLeft, ArrowRight, CircleAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AmplitudeBar } from './amplitude-bar'
import { PreviewAudioBubble } from './preview-audio-bubble'
import { useAudioRecorder } from '@/002-hooks/use-audio-recorder-sample'
import { useAmplitudeVisualizer } from '@/002-hooks/use-amplitude-visualizer-sample'
import { useSendDoctorVoiceSample } from '@/002-hooks/use-doctor-voice-sample'
import { useAuthStore } from '@/store/auth-store'
import { VOICE_PHRASES } from '@/lib/phrases'
import VoiceUserIcon from '../svg/voice-user-icon'
import { cn } from '@/lib/utils'

interface VoiceSampleStepperProps {
  doctorId: string
  onClose: () => void
  onUploadSuccess?: () => void
  isOpen: boolean
}

const MAX_RECORD_SECONDS = 15
const STORAGE_KEY = 'voice-sample-progress'

// Framer Motion variants for sliding in/out
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export function VoiceSampleStepperBox({ doctorId, onClose, isOpen, onUploadSuccess }: VoiceSampleStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  // +1 for “next” slide, –1 for “back”
  const [direction, setDirection] = useState<number>(0)

  const [audioBlobs, setAudioBlobs] = useState<Array<Blob | null>>(Array(VOICE_PHRASES.length).fill(null))
  const [audioURLs, setAudioURLs] = useState<Array<string | null>>(Array(VOICE_PHRASES.length).fill(null))
  const [error, setError] = useState<string | null>(null)

  const updateVoiceEmbeddingReady = useAuthStore((s) => s.updateVoiceEmbeddingReady)
  const { mutateAsync: upload, isPending: isUploading, error: uploadError } = useSendDoctorVoiceSample()

  const {
    start,
    stop,
    reset,
    isRecording,
    seconds,
    audioBlob,
    stream,
    error: recordError,
  } = useAudioRecorder({ maxDuration: MAX_RECORD_SECONDS })
  const { amplitudes, start: startVisualizer, stop: stopVisualizer } = useAmplitudeVisualizer(4)

  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load saved progress
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const { blobs, step } = JSON.parse(saved) as {
        blobs: string[]
        step: number
      }
      const urls = blobs.map((b64) =>
        b64 ? URL.createObjectURL(new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))])) : null
      )
      const blobsArr = blobs.map((b64) => (b64 ? new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))]) : null))
      setAudioURLs(urls)
      setAudioBlobs(blobsArr)
      setCurrentStep(step)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Persist progress
  useEffect(() => {
    if (typeof window === 'undefined') return

    const persist = async () => {
      try {
        const toB64 = async (blob: Blob | null): Promise<string | null> => {
          if (!blob) return null
          const buffer = await blob.arrayBuffer()
          let binary = ''
          const bytes = new Uint8Array(buffer)
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          return btoa(binary)
        }

        const base64s = await Promise.all(audioBlobs.map(toB64))
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ blobs: base64s, step: currentStep }))
      } catch (err) {
        console.warn('Failed to persist voice sample:', err)
      }
    }

    void persist()
  }, [audioBlobs, currentStep])

  // Combine recorder/upload errors
  useEffect(() => {
    let msg: string | null = null
    if (recordError) {
      msg = recordError
    } else if (uploadError instanceof Error) {
      msg = uploadError.message
    } else if (typeof uploadError === 'string') {
      msg = uploadError
    }
    setError(msg)
  }, [recordError, uploadError])

  // Visualizer start/stop
  useEffect(() => {
    if (isRecording && stream) startVisualizer(stream)
    else stopVisualizer()
  }, [isRecording, stream, startVisualizer, stopVisualizer])

  // Only save a new blob when recording actually finishes
  // Only save a new blob when recording actually finishes
  useEffect(() => {
    if (!audioBlob) return

    setAudioBlobs((prevBlobs) => {
      const newBlobs = [...prevBlobs]
      newBlobs[currentStep] = audioBlob
      return newBlobs
    })

    setAudioURLs((prevURLs) => {
      const newURLs = [...prevURLs]
      newURLs[currentStep] = URL.createObjectURL(audioBlob)
      return newURLs
    })
  }, [audioBlob])

  const handleReRecord = (): void => {
    reset()
    setAudioBlobs((prev) => {
      const copy = [...prev]
      copy[currentStep] = null
      return copy
    })
    setAudioURLs((prev) => {
      const copy = [...prev]
      copy[currentStep] = null
      return copy
    })
    setError(null)
  }

  const handleUpload = async (): Promise<void> => {
    const blobs = audioBlobs.filter((b): b is Blob => b !== null)
    if (blobs.length < VOICE_PHRASES.length) {
      setError(`Please complete all ${VOICE_PHRASES.length} recordings.`)
      return
    }

    try {
      const result = await upload({ doctorId, audioFiles: blobs })

      if (!result.voiceEmbeddingReady) {
        setError('Embedding failed. Please re-record.')
        return
      }

      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.warn('Failed to clear local voice sample state:', e)
      }

      updateVoiceEmbeddingReady(true)
      onUploadSuccess?.()
      onClose()
    } catch (err) {
      setError('Upload failed. Please try again.')
    }
  }

  const paginate = (newStep: number): void => {
    setDirection(newStep > currentStep ? 1 : -1)
    setCurrentStep(newStep)
  }

  if (!isOpen) return null

  const hasAudio = Boolean(audioBlobs[currentStep] && audioURLs[currentStep])
  const isFinalStep = currentStep === VOICE_PHRASES.length - 1

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50' role='dialog' aria-modal='true'>
      <div className='bg-card rounded-lg p-6 w-full max-w-md mx-4 shadow-lg relative md:h-[60vh] h-[70vh] overflow-hidden'>
        <header className='flex justify-between items-center mb-8'>
          <h2 className='text-lg font-semibold'>
            Voice Sample {currentStep + 1} of {VOICE_PHRASES.length}
          </h2>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-destructive transition-colors'
            aria-label='Close modal'>
            <X size={20} />
          </button>
        </header>
        {/* STEPPER */}
        <div className='flex items-center mb-5 px-1'>
          {VOICE_PHRASES.map((_, index) => {
            const isLast = index === VOICE_PHRASES.length - 1
            const isCompleted = index <= currentStep

            return (
              <div key={index} className={`flex items-center${!isLast ? ' flex-1' : ''}`}>
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm font-semibold ${
                    isCompleted ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground border-muted-foreground'
                  }`}>
                  {index + 1}
                </div>
                {!isLast && <div className='flex-1 h-0.5 bg-border mx-1' />}
              </div>
            )
          })}
        </div>
        {/* DYNAMIC CONTENT + CONTROLS */}
        <div className='relative flex-1'>
          {isClient && (
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                custom={direction}
                variants={slideVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={{ duration: 0.3 }}
                className='absolute inset-0 flex flex-col justify-between'>
                {/* PROMPT */}
                <div
                  className={cn(
                    'text-sm font-mono text-muted-foreground bg-muted p-3 rounded',
                    error ? 'mb-2' : 'mb-8'
                  )}>
                  <div className='text-foreground font-medium mb-1 flex gap-2 '>
                    <VoiceUserIcon width={20} height={20} /> Please read aloud:
                  </div>
                  <p>{VOICE_PHRASES[currentStep]}</p>
                </div>

                {/* ERROR */}
                {error && (
                  <div className='flex items-center gap-2 text-destructive text-sm mb-3 px-4 py-1 rounded-full text-center mx-auto bg-red-200 border-red-500'>
                    <CircleAlert size={14} /> {error}
                  </div>
                )}

                {/* INNER STATE */}
                <div className='flex-1 flex flex-col justify-center'>
                  <AnimatePresence mode='wait' initial={false}>
                    {isRecording ? (
                      <motion.div
                        key='recording'
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -20 },
                        }}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                        transition={{ duration: 0.2 }}
                        className='flex flex-col items-center'>
                        <AmplitudeBar amplitudes={amplitudes} />
                        <span className='text-xs text-muted-foreground mt-2'>
                          {seconds < 10 ? `00:0${seconds}` : `00:${seconds}`}
                        </span>
                        <Button onClick={stop} type='button' variant='destructive' className='mt-4 flex-1'>
                          <Square size={18} className='mr-2' />
                          Stop
                        </Button>
                      </motion.div>
                    ) : hasAudio ? (
                      <motion.div
                        key='preview'
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -20 },
                        }}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                        transition={{ duration: 0.2 }}
                        className='flex flex-col items-center'>
                        <span className='text-xs text-muted-foreground mb-3'>Preview your recording</span>
                        <PreviewAudioBubble src={audioURLs[currentStep]!} />
                        <div className='flex flex-wrap justify-center gap-2 mt-8 w-full'>
                          {currentStep > 0 && (
                            <Button onClick={() => paginate(currentStep - 1)} variant='ghost' className='flex-1'>
                              <ArrowLeft size={18} className='mr-2' />
                              Back
                            </Button>
                          )}
                          <Button onClick={handleReRecord} variant='outline' className='flex-1'>
                            <Repeat2 size={18} className='mr-2' />
                            Re-record
                          </Button>
                          {isFinalStep ? (
                            <Button onClick={handleUpload} variant='default' className='flex-1' disabled={isUploading}>
                              {isUploading ? (
                                <>
                                  <Loader2 size={18} className='animate-spin mr-2' />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={18} className='mr-2' />
                                  Upload
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button onClick={() => paginate(currentStep + 1)} variant='default' className='flex-1'>
                              Next
                              <ArrowRight size={18} className='ml-2' />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key='start'
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -20 },
                        }}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                        transition={{ duration: 0.2 }}
                        className='flex flex-col items-center'>
                        <Button onClick={start} type='button' variant='default' className='w-full'>
                          <Mic size={18} className='mr-2' />
                          Start Recording
                        </Button>
                        {currentStep > 0 && (
                          <Button onClick={() => paginate(currentStep - 1)} variant='ghost' className='mt-4 flex-1'>
                            <ArrowLeft size={18} className='mr-2' />
                            Back
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
