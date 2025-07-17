import { Patient } from '@/types'

const API_URL = 'http://localhost:8000' // Your backend

export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/patients`, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Failed to fetch patients')
  }

  const data = await res.json()

  if (!Array.isArray(data)) {
    throw new Error('Invalid response format')
  }

  return data as Patient[]
}

export async function createPatient(form: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to create patient: ${errorText}`)
  }

  const data = await res.json()

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid patient creation response')
  }

  return data as Patient
}
