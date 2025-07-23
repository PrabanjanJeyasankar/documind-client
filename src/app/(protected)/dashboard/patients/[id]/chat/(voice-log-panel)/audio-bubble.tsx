'use client'

import React, { FC, useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/utils/chat-conversation'
import { useWavesurfer } from '@wavesurfer/react'

export interface AudioBubbleProps {
  src: string
  duration?: number
}

export const AudioBubble: FC<AudioBubbleProps> = ({ src, duration }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [audioDuration, setAudioDuration] = useState<number>(duration ?? 0)

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    waveColor: '#E5E7EB',
    progressColor: '#10B981',
    barWidth: 3,
    barRadius: 20,
    height: 30,
    cursorColor: 'transparent',
    url: src,
    normalize: true,
    backend: 'MediaElement',
  })

  useEffect(() => {
    if (!wavesurfer) return

    const handleReady = () => {
      const d = wavesurfer.getDuration()
      setAudioDuration(Number.isFinite(d) ? d : 0)
    }

    const handleAudioProcess = (t: number) => {
      setCurrentTime(t)
    }

    const handleFinish = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    wavesurfer.on('ready', handleReady)
    wavesurfer.on('audioprocess', handleAudioProcess)
    wavesurfer.on('finish', handleFinish)

    return () => {
      wavesurfer.un('ready', handleReady)
      wavesurfer.un('audioprocess', handleAudioProcess)
      wavesurfer.un('finish', handleFinish)
    }
  }, [wavesurfer])

  const handlePlayPause = () => {
    if (!wavesurfer) return
    wavesurfer.playPause()
    setIsPlaying((prev) => !prev)
  }

  return (
    <div className='flex items-center space-x-2 font-sans'>
      <Button size='icon' variant='outline' onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <Pause className='w-4 h-4 text-primary fill-primary' />
        ) : (
          <Play className='w-4 h-4 text-primary fill-primary' />
        )}
      </Button>

      <div ref={containerRef} className='flex-1 h-8 overflow-hidden min-w-0 rounded' />
      <span className='text-xs font-mono text-muted select-none'>
        {formatDuration(currentTime)} / {formatDuration(audioDuration)}
      </span>
    </div>
  )
}
