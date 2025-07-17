'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { DashboardTabItem, TabAnimationConfig, TabDimensions } from '@/types'
import { JSX } from 'react/jsx-runtime'

interface TabIndicatorProps {
  selectedItem: DashboardTabItem | undefined
  dimensions: TabDimensions
  animationConfig: TabAnimationConfig
}

export function TabIndicator({ selectedItem, dimensions, animationConfig }: TabIndicatorProps): JSX.Element {
  return (
    <motion.div
      className={cn('absolute rounded-lg z-[1]', selectedItem?.color || 'bg-[var(--color-primary)]')}
      initial={false}
      animate={{
        width: Math.max(0, dimensions.width - 8),
        x: dimensions.left + 4,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: animationConfig.stiffness,
        damping: animationConfig.damping,
      }}
      style={{ height: 'calc(100% - 8px)', top: '4px' }}
    />
  )
}
