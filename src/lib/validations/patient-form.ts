// utils/patient-form-validation.ts
import type { Patient } from '@/types'

export interface PatientFormErrors {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: string
  contactEmail?: string
  contactPhone?: string
  bloodType?: string
  primaryDoctorId?: string
  // You can extend for others if you want to show more
}

export function validatePatientForm(
  form: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'fullName' | 'lastVisit'>
): PatientFormErrors {
  const errors: PatientFormErrors = {}

  // Required
  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'

  // Date: required and must be in past
  if (!form.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
  else if (isNaN(Date.parse(form.dateOfBirth))) errors.dateOfBirth = 'Invalid date'
  else if (new Date(form.dateOfBirth) > new Date()) errors.dateOfBirth = 'Date of birth must be in the past'

  // Gender
  if (!form.gender) errors.gender = 'Gender is required'
  else if (!['male', 'female', 'other'].includes(form.gender)) errors.gender = 'Invalid gender'

  // Email format
  if (form.contactEmail) {
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.contactEmail)) errors.contactEmail = 'Invalid email address'
  }

  // Phone (optional, but must be a valid format if present)
  if (form.contactPhone) {
    // Accepts +, -, (), spaces; must have at least 6 digits
    if (!/^\+?[0-9\s\-()]{6,}$/.test(form.contactPhone.replace(/[\s\-()]/g, '')))
      errors.contactPhone = 'Invalid phone number'
  }

  // Blood type (optional but if present, must be valid)
  if (form.bloodType) {
    const allowed = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    if (!allowed.includes(form.bloodType.trim().toUpperCase())) {
      errors.bloodType = 'Blood type must be A+, A-, B+, B-, O+, O-, AB+, or AB-'
    }
  }

  // primaryDoctorId
  if (!form.primaryDoctorId) errors.primaryDoctorId = 'Doctor ID missing (this should never happen)'

  return errors
}
