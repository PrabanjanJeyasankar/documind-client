'use client'

import { Mic, Pause, Play, UploadCloud } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import FileUpload from '@/app/(protected)/dashboard/patients/[id]/chat/(voice-log-panel)/audio-file-upload'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AIVoiceProps {
  onRecordingComplete?: (audio: Blob) => void
  showTopGradient?: boolean
}

type RecorderState = 'idle' | 'recording' | 'paused'

export default function AudioRecordUploadInput({ onRecordingComplete, showTopGradient }: AIVoiceProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [time, setTime] = useState<number>(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    if (state === 'recording') {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
    } else if (state === 'idle') {
      setTime(0)
    }
    if (state !== 'recording' && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Your browser does not support audio recording.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      audioChunksRef.current = []

      recorder.ondataavailable = (e: BlobEvent) => {
        audioChunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (onRecordingComplete) onRecordingComplete(audioBlob)
        audioChunksRef.current = []
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      setState('recording')
      setTime(0)
    } catch (e) {
      alert('Microphone access denied or unavailable.')
    }
  }, [onRecordingComplete])

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setState('idle')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
      setState('paused')
    }
  }
  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
      setState('recording')
    }
  }

  const handleMicClick = () => {
    if (state === 'idle') startRecording()
    else stopRecording()
  }

  const handleUploadError = (error: { message: string }) => {
    toast.error(error.message)
  }

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [mediaRecorder])

  return (
    <TooltipProvider>
      {showTopGradient && (
        <div className='pointer-events-none absolute bottom-28 left-0 right-0 h-8 bg-gradient-to-t from-black/5 to-transparent z-10' />
      )}

      <div className='w-full flex justify-between items-center px-6 pt-4 '>
        {/* Upload Audio Button Left */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='secondary'
              size='lg' // larger button
              onClick={() => setUploadModalOpen(true)}
              className='flex items-center justify-center rounded-full gap-1 p-6'>
              <UploadCloud className='w-10 h-10' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload Audio</TooltipContent>
        </Tooltip>

        {/* Recording & timer center */}
        <div className='flex flex-col items-center gap-2.5'>
          <span
            className={cn(
              'font-mono text-sm transition-opacity duration-300 mt-2 text-right',
              state !== 'idle' ? 'text-black/70 dark:text-white/70' : 'text-black/30 dark:text-white/30'
            )}>
            {formatTime(time)}
          </span>

          <div className='h-4 w-64 flex items-center justify-center gap-0.5 mx-auto'>
            {[...Array(48)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-0.5 rounded-full transition-all duration-300',
                  state === 'recording'
                    ? 'bg-black/50 dark:bg-white/50 animate-pulse'
                    : 'bg-black/10 dark:bg-white/10 h-1'
                )}
                style={
                  state === 'recording' || state === 'paused'
                    ? {
                        height: `${20 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.05}s`,
                        animationPlayState: state === 'paused' ? 'paused' : 'running',
                      }
                    : undefined
                }
              />
            ))}
          </div>

          <p className='h-4 text-xs text-center text-black/70 dark:text-white/70'>
            {state === 'idle' ? 'Click to speak' : state === 'paused' ? 'Paused (resume to continue)' : 'Listening...'}
          </p>
        </div>

        {/* Mic controls Right */}
        <div className='flex items-center gap-3'>
          {(state === 'recording' || state === 'paused') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  className='w-10 h-10 flex items-center justify-center rounded-full border bg-background hover:bg-muted/60 transition'
                  onClick={state === 'recording' ? pauseRecording : resumeRecording}
                  aria-label={state === 'recording' ? 'Pause' : 'Resume'}>
                  {state === 'recording' ? (
                    <Pause className='w-5 h-5 text-primary fill-primary border-none' />
                  ) : (
                    <Play className='w-5 h-5 text-primary fill-primary border-none' />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{state === 'recording' ? 'Pause' : 'Resume'}</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'group w-14 h-14 rounded-full flex items-center justify-center transition-colors',
                  'bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/80'
                )}
                type='button'
                onClick={handleMicClick}
                aria-label={state === 'idle' ? 'Start recording' : 'Stop recording'}>
                {state === 'recording' || state === 'paused' ? (
                  <div
                    className='w-6 h-6 rounded-sm animate-spin bg-muted cursor-pointer pointer-events-auto'
                    style={{
                      animationDuration: '3s',
                      animationPlayState: state === 'paused' ? 'paused' : 'running',
                    }}
                  />
                ) : (
                  <Mic className='w-6 h-6 text-muted' />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{state === 'idle' ? 'Start recording' : 'Stop & save'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Upload modal */}
      {uploadModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
          onClick={() => setUploadModalOpen(false)}
          role='dialog'
          aria-modal='true'>
          <div className='bg-background rounded-lg p-6 max-w-md w-full shadow-lg' onClick={(e) => e.stopPropagation()}>
            <h3 className='text-lg font-semibold mb-4'>Upload Audio File</h3>
            <FileUpload
              acceptedFileTypes={['audio/*']}
              maxFileSize={20 * 1024 * 1024}
              onUploadSuccess={(file) => {
                setUploadModalOpen(false)
                if (onRecordingComplete) onRecordingComplete(file)
              }}
              onUploadError={handleUploadError}
            />
            <div className='mt-4 flex justify-end'>
              <Button variant='ghost' size='sm' onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
