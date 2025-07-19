import React, { FC, useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
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

    const ws = WaveSurfer.create({
      container: containerRef.current,
      backend: 'MediaElement', // make sure you have this
      waveColor: '#E5E7EB',
      progressColor: '#10B981',
      height: 30,
      barWidth: 3,
      barRadius: 20,
      cursorWidth: 0,
      normalize: true,
    })
    waveSurferRef.current = ws

    // Swallow only AbortErrors from Wavesurfer
    const onUnhandled = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error && event.reason.name === 'AbortError') {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', onUnhandled)

    ws.load(src)
    ws.on('ready', () => {
      const d = ws.getDuration()
      setAudioDuration(Number.isFinite(d) ? d : 0)
    })
    ws.on('audioprocess', (t: number) => setCurrentTime(t))
    ws.on('finish', () => {
      setIsPlaying(false)
      setCurrentTime(0)
      ws.seekTo(0)
    })

    return () => {
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

  const onSeek = (values: number[]): void => {
    const [newTime] = values
    const ws = waveSurferRef.current
    if (!ws || audioDuration <= 0) return
    ws.seekTo(newTime / audioDuration)
    setCurrentTime(newTime)
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

      {/* <Slider
        value={[currentTime]}
        max={audioDuration}
        step={0.1}
        onValueChange={onSeek}
        aria-label='Seek audio'
        className='w-24'
      /> */}

      <span className='text-xs font-mono'>
        {formattedCurrent} / {formattedTotal}
      </span>
    </div>
  )
}
