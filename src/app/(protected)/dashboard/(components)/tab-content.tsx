'use client'

import type { DashboardTabItem, TabAnimationConfig } from '@/types'
import { motion, AnimatePresence } from 'motion/react'
import type { Variants } from 'motion'
import React from 'react'

interface TabContentProps {
  selectedItem: DashboardTabItem | undefined
  direction: number
  animationConfig: TabAnimationConfig
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'blur(4px)',
    scale: 0.98,
    position: 'absolute' as const,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    position: 'absolute' as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'blur(4px)',
    scale: 0.98,
    position: 'absolute' as const,
  }),
}

export function TabContent({ selectedItem, direction, animationConfig }: TabContentProps): React.ReactElement {
  return (
    <div className='bg-card border rounded-lg h-[300px] w-full relative overflow-hidden'>
      <AnimatePresence initial={false} mode='popLayout' custom={direction}>
        <motion.div
          key={`content-${selectedItem?.id ?? 'empty'}`}
          custom={direction}
          variants={slideVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            duration: animationConfig.duration,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ease: animationConfig.ease as any,
          }}
          className='absolute inset-0 w-full h-full will-change-transform bg-card'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}>
          {selectedItem?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
