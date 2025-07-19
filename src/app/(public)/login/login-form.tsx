'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ClassicLoader from '@/components/classic-loader'
import Link from 'next/link'
import { loginDoctor, LoginResult } from '@/001-actions/login'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

export default function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [state, setState] = useState<LoginResult>({ errors: {} })
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const setDoctor = useAuthStore((s) => s.setDoctor)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setState({ errors: {} })
    const formData = new FormData(event.currentTarget)
    try {
      const result = await loginDoctor({}, formData)
      if (result && result.errors) {
        setState(result)
        setPending(false)
      } else if (result && result.doctor) {
        setDoctor(result.doctor)
        toast.success('Login successful! Redirecting...', {
          description: 'Welcome back to DocuMind',
        })
        router.push('/dashboard')
      }
    } catch {
      setState({ errors: { form: 'Something went wrong.' } })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props} autoComplete='off'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
        <p className='text-muted-foreground text-sm text-balance'>Enter your email below to login to your account</p>
      </div>
      <div className='grid gap-6'>
        <div className='grid gap-1.5'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' name='email' type='email' placeholder='email@example.com' />
          {state.errors?.email && <p className='text-sm text-red-500'>{state.errors.email}</p>}
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' name='password' type='password' placeholder='password' />
          {state.errors?.password && <p className='text-sm text-red-500'>{state.errors.password}</p>}
        </div>
        {state.errors?.form && <p className='text-sm text-red-500 text-center'>{state.errors.form}</p>}
        <Button type='submit' className='w-full' disabled={pending}>
          {pending ? (
            <div className='flex items-center justify-center gap-4'>
              <ClassicLoader size='xs' color='white' className='mb-2' />
              Logging in...
            </div>
          ) : (
            'Login'
          )}
        </Button>
      </div>
      <div className='text-center text-sm'>
        Don&apos;t have an account?{' '}
        <Link href='/register' className='underline underline-offset-4'>
          Sign up
        </Link>
      </div>
    </form>
  )
}
