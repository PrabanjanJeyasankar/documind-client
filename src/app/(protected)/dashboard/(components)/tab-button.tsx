'use client'

import type React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { DashboardTabItem } from '@/types'
import { JSX } from 'react/jsx-runtime'

interface TabButtonProps {
  item: DashboardTabItem
  isSelected: boolean
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  buttonRef: (el: HTMLButtonElement | null) => void
}

export function TabButton({ item, isSelected, onClick, onKeyDown, buttonRef }: TabButtonProps): JSX.Element {
  return (
    <motion.button
      ref={buttonRef}
      type='button'
      role='tab'
      aria-selected={isSelected}
      aria-controls={`panel-${item.id}`}
      id={`tab-${item.id}`}
      tabIndex={isSelected ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        'relative flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 min-w-0 flex-1',
        'text-sm font-medium transition-all duration-200 font-sans',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',

        isSelected
          ? 'text-[var(--color-primary-foreground)]'
          : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]'
      )}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={isSelected ? { background: `var(--color-primary)` } : undefined}>
      <item.icon
        className={cn(
          'w-4 h-4 shrink-0',
          isSelected ? 'text-[var(--color-primary-foreground)]' : 'text-[var(--color-muted-foreground)]'
        )}
      />
      <span className='truncate'>{item.title}</span>
    </motion.button>
  )
}
