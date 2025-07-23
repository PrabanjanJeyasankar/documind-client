'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export default function HomePage() {
  const doctor = useAuthStore((s) => s.doctor)
  const router = useRouter()

  useEffect(() => {
    if (doctor) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [doctor, router])

  return null
}
