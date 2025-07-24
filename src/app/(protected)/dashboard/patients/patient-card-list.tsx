'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User, MessageSquare, UserPlus } from 'lucide-react'
import type { Patient } from '@/types'
import { motion } from 'motion/react'

interface PatientCardsListProps {
  patients: Patient[]
}

export function PatientCardsList({ patients }: PatientCardsListProps) {
  const router = useRouter()
  if (patients.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-72'>
        <div className='rounded-2xl px-8 py-10 flex flex-col items-center animate-in fade-in duration-500'>
          <motion.span
            className='inline-block rounded-full bg-primary/10 p-5 mb-5'
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: 'easeInOut',
              repeatType: 'loop',
            }}>
            <UserPlus className='w-14 h-14 text-primary' />
          </motion.span>
          <h2 className='text-2xl font-bold font-sans text-foreground mb-2 tracking-tight'>No patients found</h2>
          <p className='text-muted-foreground mb-3 font-sans text-center max-w-md'>
            You haven&apos;t added any patients yet. <br />
            Click <span className='font-semibold text-primary'>“Create Patient”</span> to get started.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {patients.map((patient) => (
        <div key={patient.id} className='bg-muted border border-muted-foreground/10 rounded-xl p-5 flex flex-col gap-2'>
          <div className='flex items-center gap-3 mb-2'>
            <User className='w-8 h-8 text-[var(--color-primary)]' />
            <div>
              <div className='font-semibold text-lg'>
                {patient.firstName} {patient.lastName}
              </div>
              <div className='text-xs text-muted-foreground'>
                {patient.gender || 'Unknown'} | {patient.dateOfBirth?.slice(0, 10) || '-'}
              </div>
            </div>
          </div>
          <div className='text-xs text-muted-foreground mb-1'>
            <span>{patient.contactEmail || 'No email'}</span> · <span>{patient.contactPhone || 'No phone'}</span>
          </div>
          <div className='flex-1'></div>
          <Button
            variant='default'
            className='w-full mt-2'
            onClick={() => router.push(`/dashboard/patients/${patient.id}/chat`)}>
            <MessageSquare className='w-4 h-4 mr-1' />
            Open Chat
          </Button>
        </div>
      ))}
    </div>
  )
}
