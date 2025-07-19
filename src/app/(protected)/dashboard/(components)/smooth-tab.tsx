/* eslint-disable @typescript-eslint/no-explicit-any */
// smooth-tab.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'

import { useTabDimensions } from '@/002-hooks/use-tab-dimension'
import type { DashboardTabItem, TabAnimationConfig } from '@/types'
import { cn } from '@/lib/utils'
import React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { DASHBOARD_TABS } from './dashboard-items'
import { TabIndicator } from './tab-indicator'
import { TabButton } from './tab-button'
import { TabContent } from './tab-content'

const ANIMATION_CONFIG: TabAnimationConfig = {
  duration: 0.2,
  ease: [0.32, 0.72, 0, 1],
  stiffness: 500,
  damping: 35,
}

interface SmoothTabProps {
  className?: string
  children?: React.ReactNode
}

export default function SmoothTab({ className, children }: SmoothTabProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Find current tab
  const selectedTab = DASHBOARD_TABS.find((tab) => pathname === tab.href) || DASHBOARD_TABS[0]
  const selected = selectedTab.id
  const selectedItem = selectedTab

  const { dimensions, buttonRefs, containerRef } = useTabDimensions(selected)

  function handleTabClick(tab: DashboardTabItem) {
    if (tab.href && pathname !== tab.href) {
      router.push(tab.href)
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div
        ref={containerRef}
        role='tablist'
        aria-label='Dashboard tabs'
        className={cn(
          'flex items-center gap-1 p-1 mb-2 relative',
          'bg-background w-full max-w-2xl',
          'border rounded-lg',
          'transition-all duration-200'
        )}>
        <TabIndicator selectedItem={selectedItem} dimensions={dimensions} animationConfig={ANIMATION_CONFIG} />
        <div
          className='grid w-full gap-1 relative z-[2]'
          style={{ gridTemplateColumns: `repeat(${DASHBOARD_TABS.length}, 1fr)` }}>
          {DASHBOARD_TABS.map((item) => {
            const isSelected = selected === item.id
            return (
              <TabButton
                key={item.id}
                item={item}
                isSelected={isSelected}
                onClick={() => handleTabClick(item)}
                onKeyDown={() => handleTabClick(item)}
                buttonRef={(el) => {
                  if (el) buttonRefs.current.set(item.id, el)
                  else buttonRefs.current.delete(item.id)
                }}
              />
            )
          })}
        </div>
      </div>
      <div className='flex-1 relative'>
        {/* Show 'content' if defined, otherwise render child routes via children */}
        {selectedItem.content ? (
          <TabContent selectedItem={selectedItem} direction={0} animationConfig={ANIMATION_CONFIG} />
        ) : (
          <div className='flex-1 relative flex flex-col min-h-[400px]'>
            <div className='bg-card rounded-lg w-full relative overflow-auto px-2 py-3 flex-1'>
              <AnimatePresence mode='popLayout' initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ x: 32, opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                  animate={{ x: 0, opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ x: -32, opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                  transition={{
                    duration: ANIMATION_CONFIG.duration,
                    ease: ANIMATION_CONFIG.ease as any,
                  }}
                  className='w-full h-full will-change-transform bg-card'
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}>
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
