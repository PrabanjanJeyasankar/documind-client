'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ClassicLoader from '@/components/classic-loader'
import type { Patient } from '@/types'

import { cn } from '@/lib/utils'
import { PatientFormErrors, validatePatientForm } from '@/lib/validations/patient-form'

type PatientFormData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'fullName' | 'lastVisit'>
interface PatientFormProps {
  doctorId: string
  onCancel: () => void
  onCreated: (form: PatientFormData) => void
  saving?: boolean
}

const EMPTY_FORM: PatientFormData = {
  externalId: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  bloodType: '',
  allergies: [],
  chronicConditions: [],
  medicalTags: [],
  notes: '',
  primaryDoctorId: '',
}

export function PatientForm({ doctorId, onCancel, onCreated, saving }: PatientFormProps) {
  const [form, setForm] = useState<PatientFormData>({ ...EMPTY_FORM, primaryDoctorId: doctorId })
  const [errors, setErrors] = useState<PatientFormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setErrors(validatePatientForm({ ...form, primaryDoctorId: doctorId }))
  }, [form, doctorId])

  function handleChange<K extends keyof PatientFormData>(key: K, value: PatientFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function handleBlur<K extends keyof PatientFormData>(key: K) {
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    const validationErrors = validatePatientForm({ ...form, primaryDoctorId: doctorId })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    onCreated({ ...form, primaryDoctorId: doctorId })
  }

  function showError(field: keyof PatientFormErrors) {
    return touched[field] && !!errors[field]
  }

  return (
    <form
      className='mb-8 p-6 rounded-xl border bg-card flex flex-col gap-4 max-w-xl'
      onSubmit={handleSubmit}
      autoComplete='off'
      noValidate>
      <div className='flex gap-4'>
        <div className='flex-1'>
          <Input
            type='text'
            placeholder='First Name'
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={cn(showError('firstName') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('firstName')}
          />
          {showError('firstName') && <span className='text-xs text-red-500 mt-1'>{errors.firstName}</span>}
        </div>
        <div className='flex-1'>
          <Input
            type='text'
            placeholder='Last Name'
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={cn(showError('lastName') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('lastName')}
          />
          {showError('lastName') && <span className='text-xs text-red-500 mt-1'>{errors.lastName}</span>}
        </div>
      </div>
      <div className='flex gap-4'>
        <div className='flex-1'>
          <Input
            type='date'
            placeholder='Date of Birth'
            value={form.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            className={cn(showError('dateOfBirth') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('dateOfBirth')}
          />
          {showError('dateOfBirth') && <span className='text-xs text-red-500 mt-1'>{errors.dateOfBirth}</span>}
        </div>
        <div className='flex-1'>
          <Select value={form.gender ?? ''} onValueChange={(value) => handleChange('gender', value)} required={false}>
            <SelectTrigger className={cn(showError('gender') && 'border-red-500 ring-2 ring-red-300')}>
              <SelectValue placeholder='Gender' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='male'>Male</SelectItem>
              <SelectItem value='female'>Female</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
          {showError('gender') && <span className='text-xs text-red-500 mt-1'>{errors.gender}</span>}
        </div>
      </div>
      <Input
        type='text'
        placeholder='External ID'
        value={form.externalId ?? ''}
        onChange={(e) => handleChange('externalId', e.target.value)}
        onBlur={() => handleBlur('externalId')}
      />
      <div className='flex gap-4'>
        <div className='flex-1'>
          <Input
            type='email'
            placeholder='Email'
            value={form.contactEmail ?? ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            onBlur={() => handleBlur('contactEmail')}
            className={cn(showError('contactEmail') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('contactEmail')}
          />
          {showError('contactEmail') && <span className='text-xs text-red-500 mt-1'>{errors.contactEmail}</span>}
        </div>
        <div className='flex-1'>
          <Input
            type='tel'
            placeholder='Phone'
            value={form.contactPhone ?? ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            onBlur={() => handleBlur('contactPhone')}
            className={cn(showError('contactPhone') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('contactPhone')}
          />
          {showError('contactPhone') && <span className='text-xs text-red-500 mt-1'>{errors.contactPhone}</span>}
        </div>
      </div>
      <Input
        type='text'
        placeholder='Address'
        value={form.address ?? ''}
        onChange={(e) => handleChange('address', e.target.value)}
        onBlur={() => handleBlur('address')}
      />
      <Input
        type='text'
        placeholder='Blood Type'
        value={form.bloodType ?? ''}
        onChange={(e) => handleChange('bloodType', e.target.value)}
        onBlur={() => handleBlur('bloodType')}
        className={cn(showError('bloodType') && 'border-red-500 ring-2 ring-red-300')}
        aria-invalid={!!showError('bloodType')}
      />
      {showError('bloodType') && <span className='text-xs text-red-500 mt-1'>{errors.bloodType}</span>}
      <Input
        type='text'
        placeholder='Allergies (comma separated)'
        value={form.allergies?.join(', ') || ''}
        onChange={(e) =>
          handleChange(
            'allergies',
            e.target.value
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          )
        }
        onBlur={() => handleBlur('allergies')}
      />
      <Input
        type='text'
        placeholder='Chronic Conditions (comma separated)'
        value={form.chronicConditions?.join(', ') || ''}
        onChange={(e) =>
          handleChange(
            'chronicConditions',
            e.target.value
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          )
        }
        onBlur={() => handleBlur('chronicConditions')}
      />
      <Input
        type='text'
        placeholder='Medical Tags (comma separated)'
        value={form.medicalTags?.join(', ') || ''}
        onChange={(e) =>
          handleChange(
            'medicalTags',
            e.target.value
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          )
        }
        onBlur={() => handleBlur('medicalTags')}
      />
      <Textarea
        placeholder='Notes'
        value={form.notes ?? ''}
        onChange={(e) => handleChange('notes', e.target.value)}
        onBlur={() => handleBlur('notes')}
      />
      <div className='flex items-center'>
        <Button type='submit' disabled={saving} aria-disabled={saving} className='w-32'>
          {saving ? (
            <span className='flex items-center justify-center'>
              <ClassicLoader className='w-5 h-5 mr-2' />
              Saving...
            </span>
          ) : (
            'Save'
          )}
        </Button>
        <Button type='button' variant='ghost' className='ml-4' onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
