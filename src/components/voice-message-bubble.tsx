import React, { FC } from 'react'
import type { VoiceRecording } from '@/types'
import { AudioBubble } from './audio-bubble'
import { CheckCircle2, Loader, RotateCcw } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

interface VoiceMessageBubbleProps {
  rec: VoiceRecording
  onRetry: (rec: VoiceRecording) => void
}

export const VoiceMessageBubble: FC<VoiceMessageBubbleProps> = ({ rec, onRetry }) => {
  const timeString = new Date(rec.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const renderStatus = (): JSX.Element => {
    if (rec.status === 'pending') {
      return <Loader className='w-4 h-4 animate-spin text-white' />
    }

    if (rec.status === 'sent') {
      return <CheckCircle2 className='w-4 h-4 text-green-400' />
    }

    return (
      <div className='flex items-center space-x-2'>
        <div className='w-4 h-4 flex items-center justify-center rounded-full bg-red-600 text-muted text-[10px] font-bold opacity-100'>
          !
        </div>
        {rec.errorCode !== 'no_speech_detected' && (
          <button
            onClick={() => onRetry(rec)}
            className='flex items-center gap-1 text-red-500 border border-red-500 rounded-full px-2 py-0.5 text-xs font-sans hover:bg-red-50 transition'>
            <RotateCcw className='w-3 h-3' />
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='flex justify-end px-4 mt-4'>
      <div className='relative w-full max-w-[300px] min-w-[220px]'>
        <div className='bg-black text-white font-sans p-3 pb-6 rounded-2xl rounded-tr-none shadow-lg relative'>
          {/* tail */}
          <div className='absolute bg-black w-3 h-3 rotate-45 bottom-0 right-2' />
          {/* waveform */}
          <AudioBubble src={rec.url} duration={rec.duration} />
          {/* timestamp + status */}
          <div className='absolute bottom-2 right-3 flex items-center space-x-2 text-[10px] font-mono'>
            <span className='opacity-75'>{timeString}</span>
            {renderStatus()}
          </div>
        </div>
      </div>
    </div>
  )
}
