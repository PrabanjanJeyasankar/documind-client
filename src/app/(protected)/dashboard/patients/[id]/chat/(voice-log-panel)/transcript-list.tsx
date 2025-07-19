import React, { FC, useMemo } from 'react'
import type { TranscriptSegment } from '@/types'

interface TranscriptListProps {
  segments: TranscriptSegment[]
}

export const TranscriptList: FC<TranscriptListProps> = ({ segments }) => {
  const speakerMap = useMemo(() => {
    const map = new Map<string, number>()
    let next = 1
    for (const seg of segments) {
      if (!map.has(seg.speaker)) {
        map.set(seg.speaker, next++)
      }
    }
    return map
  }, [segments])

  return (
    <div className='space-y-1'>
      {segments.map((seg) => {
        const num = speakerMap.get(seg.speaker)!
        return (
          <div key={`${seg.start}-${num}`} className='text-sm font-sans'>
            <span className='font-mono'>{`Speaker ${num}:`}</span> {seg.text}
          </div>
        )
      })}
    </div>
  )
}
