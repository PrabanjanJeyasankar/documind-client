'use client'

import { useState, useRef, useEffect } from 'react'
import { Stethoscope, LogOut } from 'lucide-react'
import { JSX } from 'react/jsx-runtime'
import { useAuthStore } from '@/store/auth-store'

function Avatar({ letter }: { letter: string }): JSX.Element {
  return (
    <div
      className='w-10 h-10 rounded-full border border-muted-foreground/20 bg-white flex items-center justify-center cursor-pointer select-none'
      style={{ userSelect: 'none' }}
      aria-label={`User avatar: ${letter}`}>
      <span className='text-black font-base text-xl leading-none'>{letter}</span>
    </div>
  )
}

export function DashboardNav(): JSX.Element | null {
  const doctor = useAuthStore((state) => state.doctor)
  const logout = useAuthStore((state) => state.logout)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!doctor) return null

  const firstLetter = doctor.name.charAt(0).toUpperCase()

  return (
    <nav className='w-full flex items-center justify-between px-6 py-2 border-b bg-sidebar-accent font-sans'>
      <div className='flex items-center gap-3'>
        <Stethoscope className='text-primary bg-background' />
        <div>
          <div className='font-bold text-xl font-sans'>DocuMind</div>
          <div className='text-muted-foreground text-sm font-sans'>Intelligent Medical Assistant</div>
        </div>
      </div>

      <div className='relative' ref={dropdownRef}>
        <button
          type='button'
          onClick={() => setDropdownOpen((open) => !open)}
          aria-haspopup='true'
          aria-expanded={dropdownOpen}
          className='focus:outline-none'>
          <Avatar letter={firstLetter} />
        </button>

        {/* Dropdown menu */}
        <div
          className={`absolute right-0 mt-2 w-40  bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 font-sans origin-top-right transform transition-all duration-200 ease-out
            ${dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          style={{ transformOrigin: 'top right' }}>
          <button
            type='button'
            onClick={() => {
              logout()
              setDropdownOpen(false)
            }}
            className='flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900'>
            <LogOut className='w-4 h-4' />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
