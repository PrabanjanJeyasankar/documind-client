'use client'
import React, { FC, useMemo } from 'react'
import { useAuthStore } from '@/store/auth-store'
import type { TranscriptSegment } from '@/types'

interface TranscriptListProps {
  segments: TranscriptSegment[]
}

export const TranscriptList: FC<TranscriptListProps> = ({ segments }) => {
  const doctorName = useAuthStore((s) => s.doctor?.name) ?? 'Doctor'

  const genericSpeakerIndices = useMemo(() => {
    const map = new Map<string, number>()
    let next = 1
    for (const seg of segments) {
      const spk = seg.speaker
      // skip real doctor or generic "Doctor" and any "Patient N"
      if (spk === doctorName || spk === 'Doctor' || spk.startsWith('Patient ')) {
        continue
      }
      if (!map.has(spk)) {
        map.set(spk, next++)
      }
    }
    return map
  }, [segments, doctorName])

  return (
    <div className='space-y-1'>
      {segments.map((seg, i) => {
        let label: string

        if (seg.speaker === doctorName || seg.speaker === 'Doctor') {
          // either already real name, or generic placeholder
          label = 'You'
        } else if (seg.speaker.startsWith('Patient ')) {
          label = seg.speaker
        } else {
          const idx = genericSpeakerIndices.get(seg.speaker)!
          label = `Speaker ${idx}`
        }

        return (
          <div key={`${seg.start}-${i}`} className='text-sm font-sans'>
            <span className='font-mono'>{`${label}:`}</span> {seg.text}
          </div>
        )
      })}
    </div>
  )
}
