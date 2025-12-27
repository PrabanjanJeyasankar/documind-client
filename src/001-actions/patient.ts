import axios from 'axios'
import type { Patient } from '@/types'

const API_URL: string = process.env.NEXT_PUBLIC_API_URL as string

// Create patient
export async function createPatient(
  data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'fullName' | 'lastVisit'>
): Promise<Patient> {
  const response = await axios.post<Patient>(`${API_URL}/patients`, data)
  return response.data
}

// Fetch patients by doctor
export async function fetchPatientsByDoctor(doctorId: string): Promise<Patient[]> {
  const response = await axios.get<Patient[]>(`${API_URL}/patients/doctors/${doctorId}/patients`)
  return response.data
}

// actions/patient.ts
export async function fetchPatientById(patientId: string): Promise<Patient> {
  const response = await axios.get<Patient>(`${API_URL}/patients/${patientId}`)
  return response.data
}
