'use client'

import { TabDimensions } from '@/types'
import { useLayoutEffect, useState, useRef } from 'react'

export function useTabDimensions(selectedId: string) {
  const [dimensions, setDimensions] = useState<TabDimensions>({ width: 0, left: 0 })
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const updateDimensions = () => {
      const selectedButton = buttonRefs.current.get(selectedId)
      const container = containerRef.current

      if (selectedButton && container) {
        const rect = selectedButton.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        setDimensions({
          width: rect.width,
          left: rect.left - containerRect.left,
        })
      }
    }

    requestAnimationFrame(updateDimensions)

    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [selectedId])

  return { dimensions, buttonRefs, containerRef }
}
