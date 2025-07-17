import axios from 'axios'
import type { Doctor, LoginFieldErrors } from '@/types'
import { validateLoginForm } from '@/lib/validations/auth-validation'

export interface LoginResult {
  errors?: LoginFieldErrors
  doctor?: Doctor
}

export async function loginDoctor(_: unknown, formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const errors = validateLoginForm({ email, password })
  if (errors) return { errors }

  try {
    const response = await axios.post<Doctor>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/login`,
      { email, password },
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
        message = 'Login failed'
      }
    }
    return { errors: { form: message } }
  }
}
