// /components/dashboard/nav-bar.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Plus, Stethoscope } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

export function DashboardNav(): JSX.Element {
  return (
    <nav className='w-full flex items-center justify-between px-6 py-2 border-b bg-sidebar-accent font-sans'>
      <div className='flex items-center gap-3'>
        <Stethoscope className='text-primary bg-background' />

        <div>
          <div className='font-bold text-xl font-sans'>DocuMind</div>
          <div className='text-muted-foreground text-sm font-sans'>Intelligent Medical Assistant</div>
        </div>
      </div>

      <Button className='gap-2 px-4 py-2 font-sans font-semibold ' size='lg'>
        <Plus className='w-5 h-5' />
        New Recording
      </Button>
    </nav>
  )
}
