/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ClassicLoader from '@/components/classic-loader'

import { toast } from 'sonner'
import type { Patient } from '@/types'
import { useCreatePatient, usePatients } from '@/002-hooks/use-patient'
import { PatientForm } from './patient-form'
import { PatientCardsList } from './patient-card-list'

export default function PatientsPage() {
  const doctor = useAuthStore((s) => s.doctor)
  const [showForm, setShowForm] = useState(false)
  const { data: patients, isLoading } = usePatients(doctor?.id ?? '')
  const { mutateAsync: createPatient, isPending } = useCreatePatient(doctor?.id ?? '')

  const handlePatientCreated = async (
    form: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'fullName' | 'lastVisit'>
  ) => {
    try {
      await createPatient({ ...form, primaryDoctorId: doctor?.id ?? '' })
      toast.success('Patient created!')
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create patient')
    }
  }

  return (
    <div className='flex flex-col font-sans min-h-screen'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-bold'>Patients</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size='lg'>
            <Plus className='w-5 h-5 mr-2' /> Create Patient
          </Button>
        )}
      </div>

      {showForm ? (
        // Add this wrapper div with flex and centering styles
        <div className='flex justify-center items-center flex-grow'>
          <PatientForm
            doctorId={doctor?.id ?? ''}
            onCancel={() => setShowForm(false)}
            onCreated={handlePatientCreated}
            saving={isPending}
          />
        </div>
      ) : isLoading ? (
        <div className='flex justify-center items-center h-48'>
          <ClassicLoader size='md' className='w-8 h-8' />
        </div>
      ) : (
        <PatientCardsList patients={patients ?? []} />
      )}
    </div>
  )
}
