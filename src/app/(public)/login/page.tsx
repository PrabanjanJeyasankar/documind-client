import { Stethoscope } from 'lucide-react'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 font-sans'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center gap-2'>
          <div className='flex flex-col items-center gap-2 font-medium'>
            <div className='flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <Stethoscope className='size-5' />
            </div>
            <span className='sr-only'>DocuMind.</span>
          </div>
        </div>
      </div>
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  )
}
