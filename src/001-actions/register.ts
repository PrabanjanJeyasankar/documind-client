import axios from 'axios'
import { validateRegisterForm } from '@/lib/validations/auth-validation'
import type { Doctor, RegisterFieldErrors } from '@/types'

export interface RegisterResult {
  errors?: RegisterFieldErrors
  doctor?: Doctor
}

export async function registerDoctor(_prev: unknown, formData: FormData): Promise<RegisterResult> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validateRegisterForm({ name, email, password })
  if (errors) return { errors }

  try {
    const response = await axios.post<Doctor>(
      `${process.env.NEXT_PUBLIC_API_URL}/doctors/register`,
      { name, email, password },
      { headers: { 'Content-Type': 'application/json' } }
    )

    return { doctor: response.data }
  } catch (error) {
    let message = 'Server unreachable. Try again later.'

    if (axios.isAxiosError(error)) {
      if (error.response?.data?.detail) {
        message = error.response.data.detail
      } else if (typeof error.response?.data === 'string') {
        message = error.response.data
      } else {
        message = 'Registration failed'
      }
    }
    return { errors: { form: message } }
  }
}
