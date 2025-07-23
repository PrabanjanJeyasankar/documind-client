'use client'

import React, { FC } from 'react'

export interface AmplitudeBarProps {
  amplitudes: number[]
  barCount?: number
  minHeightPercent?: number
}

export const AmplitudeBar: FC<AmplitudeBarProps> = ({ amplitudes, barCount = 48, minHeightPercent = 10 }) => {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const amp = amplitudes[i] ?? 0
    const pct = Math.min(100, Math.max(minHeightPercent, (amp / 255) * 100))
    return (
      <div
        key={i}
        className='w-0.5 rounded-full bg-black/50 dark:bg-white/50 transition-all duration-100'
        style={{ height: `${pct}%` }}
      />
    )
  })

  return <div className='flex items-center justify-center gap-0.5 w-64 h-16 mx-auto'>{bars}</div>
}
