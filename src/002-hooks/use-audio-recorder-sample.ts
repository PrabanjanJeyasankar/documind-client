// hooks/use-audio-recorder.ts
import { useRef, useState, useCallback } from 'react'

export interface UseAudioRecorderResult {
  start: () => Promise<void>
  stop: () => void
  reset: () => void
  isRecording: boolean
  seconds: number
  audioBlob: Blob | null
  error: string | null
  stream: MediaStream | null
}

export interface UseAudioRecorderConfig {
  maxDuration?: number
}

export function useAudioRecorder(config?: UseAudioRecorderConfig): UseAudioRecorderResult {
  const maxDuration = config?.maxDuration ?? 15
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [seconds, setSeconds] = useState<number>(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    setIsRecording(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setSeconds(0)
    setAudioBlob(null)

    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(userStream)

      const recorder = new MediaRecorder(userStream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      setIsRecording(true)

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setIsRecording(false)

        if (userStream) {
          userStream.getTracks().forEach((track) => track.stop())
        }

        setStream(null)
      }

      recorder.start()

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= maxDuration) {
            stop()
            return maxDuration
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      setError('Microphone access denied or unavailable.')
      setIsRecording(false)
    }
  }, [stop])

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    setAudioBlob(null)
    setError(null)
    setSeconds(0)
    setIsRecording(false)

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  return { start, stop, reset, isRecording, seconds, audioBlob, error, stream }
}
