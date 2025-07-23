import { FC, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/utils/chat-conversation'
import { useWavesurfer } from '@wavesurfer/react'

export interface AudioBubbleProps {
  src: string
  duration?: number
}

export const PreviewAudioBubble: FC<AudioBubbleProps> = ({ src, duration }) => {
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

  if (wavesurfer) {
    wavesurfer.on('ready', () => {
      const d = wavesurfer.getDuration()
      setAudioDuration(Number.isFinite(d) ? d : 0)
    })
    wavesurfer.on('audioprocess', (t: number) => {
      setCurrentTime(t)
    })
    wavesurfer.on('finish', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })
  }

  const handlePlayPause = () => {
    if (!wavesurfer) return
    wavesurfer.playPause()
    setIsPlaying((prev) => !prev)
  }

  return (
    <div className='flex flex-col w-full bg-primary pl-2 pr-4 py-2 rounded-full font-sans'>
      <div className='flex flex-row items-center w-full space-x-2'>
        <Button
          size='icon'
          variant='outline'
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className='rounded-full'>
          {isPlaying ? (
            <Pause className='w-4 h-4 text-primary fill-primary' />
          ) : (
            <Play className='w-4 h-4 text-primary fill-primary' />
          )}
        </Button>
        <div ref={containerRef} className='flex-1 h-8 rounded-full overflow-hidden min-w-0' />
        <span className='text-xs font-mono text-muted select-none'>
          {formatDuration(currentTime)} / {formatDuration(audioDuration)}
        </span>
      </div>
    </div>
  )
}
