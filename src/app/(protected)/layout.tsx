'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const doctor = useAuthStore((s) => s.doctor)

  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsub = useAuthStore.persist.onHydrate(() => setHydrated(false))
    const unsub2 = useAuthStore.persist.onFinishHydration(() => setHydrated(true))

    if (useAuthStore.persist.hasHydrated()) setHydrated(true)

    return () => {
      unsub()
      unsub2()
    }
  }, [])

  useEffect(() => {
    if (hydrated && !doctor) {
      router.replace('/login')
    }
  }, [hydrated, doctor, router])

  if (!hydrated) return null
  if (!doctor) return null

  return <main className=' font-sans bg-background text-foreground'>{children}</main>
}
