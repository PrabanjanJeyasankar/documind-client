'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function TextInput({ onSubmit }: { onSubmit?: (value: string) => void }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (!value.trim()) return
    onSubmit?.(value.trim())
    setValue('')
  }

  return (
    <div className='flex items-center border bg-input border-input rounded-lg overflow-hidden px-3 py-2 font-sans'>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Type something...'
        className='flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground'
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className='p-1.5 disabled:opacity-50 text-muted-foreground hover:text-foreground transition'>
        <ArrowUp size={16} />
      </button>
    </div>
  )
}
