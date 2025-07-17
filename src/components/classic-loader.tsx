'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ClassicLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'primary' | 'foreground' | 'white'
  className?: string
}

export default function ClassicLoader({ size = 'md', color = 'primary', className }: ClassicLoaderProps) {
  const sizeClasses = {
    xs: 'size-2',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  }

  const barSizes = {
    xs: { height: '4px', width: '1px' },
    sm: { height: '6px', width: '1.5px' },
    md: { height: '8px', width: '2px' },
    lg: { height: '10px', width: '2.5px' },
  }

  const transformOriginY = {
    xs: '8px',
    sm: '10px',
    md: '12px',
    lg: '14px',
  }

  const transformOriginX = {
    xs: '0.5px',
    sm: '0.75px',
    md: '1px',
    lg: '1.25px',
  }

  const marginLeft = {
    xs: '-0.5px',
    sm: '-0.75px',
    md: '-1px',
    lg: '-1.25px',
  }

  const colorClass = {
    primary: 'bg-primary',
    foreground: 'bg-primary-foreground',
    white: 'bg-white',
  }[color]

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className='absolute h-full w-full'>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(colorClass, 'absolute animate-[spinner-fade_1.2s_linear_infinite] rounded-full')}
            style={{
              top: '0',
              left: '50%',
              marginLeft: marginLeft[size],
              transformOrigin: `${transformOriginX[size]} ${transformOriginY[size]}`,
              transform: `rotate(${i * 30}deg)`,
              opacity: 0,
              animationDelay: `${i * 0.1}s`,
              height: barSizes[size].height,
              width: barSizes[size].width,
            }}
          />
        ))}
      </div>
      <span className='sr-only'>Loading</span>
    </div>
  )
}
