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
import { TagsInput } from '@/components/tags-input'

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
      className='mb-8 p-6 rounded-xl border bg-card flex flex-col gap-6 max-w-6xl mx-auto'
      onSubmit={handleSubmit}
      autoComplete='on'
      noValidate>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* First Name */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='firstName' className='mb-1 font-semibold text-sm'>
            First Name
          </label>
          <Input
            id='firstName'
            type='text'
            placeholder='John'
            aria-label='First Name'
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={cn(showError('firstName') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('firstName')}
          />
          {showError('firstName') && <span className='text-xs text-red-500 mt-1'>{errors.firstName}</span>}
        </div>

        {/* Last Name */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='lastName' className='mb-1 font-semibold text-sm'>
            Last Name
          </label>
          <Input
            id='lastName'
            type='text'
            placeholder='Doe'
            aria-label='Last Name'
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={cn(showError('lastName') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('lastName')}
          />
          {showError('lastName') && <span className='text-xs text-red-500 mt-1'>{errors.lastName}</span>}
        </div>

        {/* Date of Birth */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='dateOfBirth' className='mb-1 font-semibold text-sm'>
            Date of Birth
          </label>
          <Input
            id='dateOfBirth'
            type='date'
            placeholder='1990-01-01'
            aria-label='Date of Birth'
            value={form.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            className={cn(showError('dateOfBirth') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('dateOfBirth')}
          />
          {showError('dateOfBirth') && <span className='text-xs text-red-500 mt-1'>{errors.dateOfBirth}</span>}
        </div>

        {/* Gender */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='gender' className='mb-1 font-semibold text-sm'>
            Gender
          </label>
          <Select value={form.gender ?? ''} onValueChange={(value) => handleChange('gender', value)} required={false}>
            <SelectTrigger id='gender' className={cn(showError('gender') && 'border-red-500 ring-2 ring-red-300')}>
              <SelectValue placeholder='Select gender' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='male'>Male</SelectItem>
              <SelectItem value='female'>Female</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
          {showError('gender') && <span className='text-xs text-red-500 mt-1'>{errors.gender}</span>}
        </div>

        {/* External ID */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='externalId' className='mb-1 font-semibold text-sm'>
            External ID
          </label>
          <Input
            id='externalId'
            type='text'
            placeholder='123-456-789'
            aria-label='External ID'
            value={form.externalId ?? ''}
            onChange={(e) => handleChange('externalId', e.target.value)}
            onBlur={() => handleBlur('externalId')}
          />
        </div>

        {/* Email */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='contactEmail' className='mb-1 font-semibold text-sm'>
            Email
          </label>
          <Input
            id='contactEmail'
            type='email'
            placeholder='john.doe@example.com'
            aria-label='Email'
            value={form.contactEmail ?? ''}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            onBlur={() => handleBlur('contactEmail')}
            className={cn(showError('contactEmail') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('contactEmail')}
          />
          {showError('contactEmail') && <span className='text-xs text-red-500 mt-1'>{errors.contactEmail}</span>}
        </div>

        {/* Phone */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='contactPhone' className='mb-1 font-semibold text-sm'>
            Phone
          </label>
          <Input
            id='contactPhone'
            type='tel'
            placeholder='+1 555 123 4567'
            aria-label='Phone'
            value={form.contactPhone ?? ''}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            onBlur={() => handleBlur('contactPhone')}
            className={cn(showError('contactPhone') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('contactPhone')}
          />
          {showError('contactPhone') && <span className='text-xs text-red-500 mt-1'>{errors.contactPhone}</span>}
        </div>

        {/* Address (full width) */}
        <div className='flex flex-col min-w-[160px] lg:col-span-3'>
          <label htmlFor='address' className='mb-1 font-semibold text-sm'>
            Address
          </label>
          <Input
            id='address'
            type='text'
            placeholder='123 Main St, Springfield, USA'
            aria-label='Address'
            value={form.address ?? ''}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
          />
        </div>

        {/* Blood Type */}
        <div className='flex flex-col min-w-[160px]'>
          <label htmlFor='bloodType' className='mb-1 font-semibold text-sm'>
            Blood Type
          </label>
          <Input
            id='bloodType'
            type='text'
            placeholder='A+, O-, B+'
            aria-label='Blood Type'
            value={form.bloodType ?? ''}
            onChange={(e) => handleChange('bloodType', e.target.value)}
            onBlur={() => handleBlur('bloodType')}
            className={cn(showError('bloodType') && 'border-red-500 ring-2 ring-red-300')}
            aria-invalid={!!showError('bloodType')}
          />
          {showError('bloodType') && <span className='text-xs text-red-500 mt-1'>{errors.bloodType}</span>}
        </div>

        {/* Allergies (full width) */}
        <div className='flex flex-col min-w-[160px] lg:col-span-3'>
          <TagsInput
            tags={form.allergies}
            onChange={(tags) => handleChange('allergies', tags)}
            label='Allergies'
            placeholder='Add allergy...'
          />
        </div>

        {/* Chronic Conditions (full width) */}
        <div className='flex flex-col min-w-[160px] lg:col-span-3'>
          <TagsInput
            tags={form.chronicConditions}
            onChange={(tags) => handleChange('chronicConditions', tags)}
            label='Chronic Conditions'
            placeholder='Add condition...'
          />
        </div>

        {/* Medical Tags (full width) */}
        <div className='flex flex-col min-w-[160px] lg:col-span-3'>
          <TagsInput
            tags={form.medicalTags}
            onChange={(tags) => handleChange('medicalTags', tags)}
            label='Medical Tags'
            placeholder='Add medical tag...'
          />
        </div>

        {/* Notes (full width) */}
        <div className='flex flex-col min-w-[160px] lg:col-span-3'>
          <label htmlFor='notes' className='mb-1 font-semibold text-sm'>
            Notes
          </label>
          <Textarea
            id='notes'
            placeholder='Additional notes about the patient...'
            aria-label='Notes'
            value={form.notes ?? ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            onBlur={() => handleBlur('notes')}
          />
        </div>
      </div>

      <div className='flex items-center gap-4 mt-6 flex-wrap'>
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
