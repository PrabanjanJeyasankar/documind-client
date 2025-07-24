'use client'

import { FC, ReactElement, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Badge, Waves, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

type GridItemSize = 'xl' | 'lg' | 'md' | 'sm'

interface GridItem {
  label: string
  value: string | ReactElement
  icon: ReactElement
  size: GridItemSize
  error?: string
}

const getGridItemClass = (size: GridItemSize): string => {
  switch (size) {
    case 'xl':
      return 'col-span-2 row-span-2 text-2xl min-h-[72px] md:text-3xl md:min-h-[100px]'
    case 'lg':
      return 'col-span-2 text-lg min-h-[56px] md:text-xl md:min-h-[80px]'
    case 'md':
      return 'col-span-1 text-base min-h-[48px] md:min-h-[64px]'
    case 'sm':
      return 'col-span-1 text-sm min-h-[40px] md:min-h-[48px]'
    default:
      return ''
  }
}

const getVoiceEmbeddingBadge = (status: boolean | undefined): ReactElement => {
  if (status === true) {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
        Ready
      </span>
    )
  }
  if (status === false) {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'>
        Not ready
      </span>
    )
  }
  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground'>
      Unknown
    </span>
  )
}

const CenteredBentoGrid: FC = () => {
  const router = useRouter()
  const doctor = useAuthStore((state) => state.doctor)
  const [isVoiceSampleOpen, setIsVoiceSampleOpen] = useState<boolean>(false)

  const items: GridItem[] = [
    {
      label: 'Name',
      value: doctor?.name ?? '',
      icon: <User className='w-5 h-5' aria-label='Name' />,
      size: 'md',
      error: !doctor?.name ? 'Name missing' : undefined,
    },
    {
      label: 'Email',
      value: doctor?.email ?? '',
      icon: <Mail className='w-4 h-4' aria-label='Email' />,
      size: 'md',
      error: !doctor?.email ? 'Email missing' : undefined,
    },
    {
      label: 'Role',
      value: doctor?.role ?? 'Not assigned',
      icon: <Badge className='w-4 h-4' aria-label='Role' />,
      size: 'md',
    },
  ]

  return (
    <main className='flex justify-center min-h-screen w-full bg-background'>
      <section
        className='
          flex flex-col
          bg-card
          w-full
          max-w-md
          md:max-w-xl
          p-0
        '
        style={{ fontFamily: 'var(--font-sans)' }}
        aria-label='Doctor Information'>
        <header className='flex items-center gap-2 p-4 md:p-6 pb-2'>
          <button
            type='button'
            aria-label='Back'
            onClick={() => router.back()}
            className='text-muted-foreground hover:text-foreground transition-colors'
            tabIndex={0}>
            <ChevronLeft className='w-6 h-6' />
          </button>
          <span className='text-lg md:text-xl font-semibold select-none'>Profile</span>
        </header>

        <div
          className='
            grid
            gap-4
            grid-cols-2
            grid-rows-2
            p-4
            md:p-8
            !pt-0
          '>
          {doctor ? (
            items.map((item) => (
              <div
                key={item.label}
                className={`
                  flex flex-col justify-center items-start gap-1
                  bg-muted p-3 rounded-lg border
                  shadow-sm transition-all
                  ${getGridItemClass(item.size)}
                `}
                tabIndex={0}
                aria-label={item.label}>
                <div className='flex items-center gap-2 mb-0.5'>
                  {item.icon}
                  <span className='font-medium'>{item.label}</span>
                </div>
                {item.error ? (
                  <span className='text-destructive text-xs'>{item.error}</span>
                ) : (
                  <span className={`truncate ${item.label === 'Voice Embedding' ? '' : 'text-base md:text-lg'}`}>
                    {item.value}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className='col-span-2 row-span-2 flex flex-col items-center justify-center text-center'>
              <User className='w-10 h-10 mb-2' aria-label='User' />
              <span className='text-lg font-medium text-muted-foreground'>No doctor is currently authenticated.</span>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default CenteredBentoGrid
