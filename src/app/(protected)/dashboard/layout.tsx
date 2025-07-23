// src/app/(protected)/dashboard/layout.tsx
'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardNav } from './(components)/navigation'
import SmoothTab from './(components)/smooth-tab'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  const isChatPage = /^\/dashboard\/patients\/[^/]+\/chat(\/.*)?$/.test(pathname)

  return (
    <div className='bg-background font-sans min-h-screen'>
      <DashboardNav />

      <div className='m-4'>{isChatPage ? <>{children}</> : <SmoothTab>{children}</SmoothTab>}</div>
    </div>
  )
}
