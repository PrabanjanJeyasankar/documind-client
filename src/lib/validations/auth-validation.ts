export function validateRegisterForm(form: { name?: string; email?: string; password?: string }) {
  const errors: Record<string, string> = {}

  if (!form.name || form.name.trim().length < 3) {
    errors.name = '* Name must be at least 3 characters.'
  }

  if (!form.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(form.email)) {
    errors.email = '* Enter a valid email address.'
  }

  if (!form.password || form.password.length < 6) {
    errors.password = '* Password must be at least 6 characters.'
  }

  return Object.keys(errors).length > 0 ? errors : null
}

export function validateLoginForm(form: { email?: string; password?: string }) {
  const errors: Record<string, string> = {}

  if (!form.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(form.email)) {
    errors.email = '* Enter a valid email address.'
  }

  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return Object.keys(errors).length > 0 ? errors : null
}
