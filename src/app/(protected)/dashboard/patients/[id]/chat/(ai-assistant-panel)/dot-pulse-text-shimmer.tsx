'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { PulseDotLoader, TextDotsLoader } from '@/components/ui/loader'

export type LoaderSize = 'sm' | 'md' | 'lg'

export interface PulseDotTextShimmerLoaderProps {
  size?: LoaderSize
  text?: string
  className?: string
}

export const DotPulseTextShimmerLoader: React.FC<PulseDotTextShimmerLoaderProps> = ({
  size = 'md',
  text = 'Thinking',
  className,
}) => {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <PulseDotLoader size={size} />
      <TextDotsLoader size={size} text={text} />
    </div>
  )
}
