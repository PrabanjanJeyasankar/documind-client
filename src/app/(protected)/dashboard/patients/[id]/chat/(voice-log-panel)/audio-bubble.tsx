import React, { FC, useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/utils/chat-conversation'

export interface AudioBubbleProps {
  src: string
  duration?: number
}

type WaveSurferInstance = ReturnType<typeof WaveSurfer.create>

export const AudioBubble: FC<AudioBubbleProps> = ({ src, duration }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const waveSurferRef = useRef<WaveSurferInstance | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [audioDuration, setAudioDuration] = useState<number>(duration ?? 0)

  useEffect(() => {
    if (!containerRef.current) return
    let unmounted = false

    const ws = WaveSurfer.create({
      container: containerRef.current,
      backend: 'MediaElement',
      waveColor: '#E5E7EB',
      progressColor: '#10B981',
      height: 30,
      barWidth: 3,
      barRadius: 20,
      cursorWidth: 0,
      normalize: true,
    })

    waveSurferRef.current = ws

    ws.load(src)
    ws.on('ready', () => {
      if (!unmounted) {
        const d = ws.getDuration()
        setAudioDuration(Number.isFinite(d) ? d : 0)
      }
    })
    ws.on('audioprocess', (t: number) => {
      if (!unmounted) setCurrentTime(t)
    })
    ws.on('finish', () => {
      if (!unmounted) {
        setIsPlaying(false)
        setCurrentTime(0)
        ws.seekTo(0)
      }
    })

    const onUnhandled = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error && event.reason.name === 'AbortError') {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', onUnhandled)

    return () => {
      unmounted = true
      window.removeEventListener('unhandledrejection', onUnhandled)
      ws.destroy()
    }
  }, [src])

  const togglePlay = (): void => {
    const ws = waveSurferRef.current
    if (!ws) return
    ws.playPause()
    setIsPlaying((p) => !p)
  }

  const formattedCurrent = formatDuration(currentTime)
  const formattedTotal = formatDuration(audioDuration)

  return (
    <div className='flex items-center space-x-2 font-sans'>
      <Button size='icon' variant='outline' onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className=''>
        {isPlaying ? (
          <Pause className='w-4 h-4 text-primary fill-primary' />
        ) : (
          <Play className='w-4 h-4 text-primary fill-primary' />
        )}
      </Button>

      <div ref={containerRef} className='flex-1 h-8' />
      <span className='text-xs font-mono'>
        {formattedCurrent} / {formattedTotal}
      </span>
    </div>
  )
}
