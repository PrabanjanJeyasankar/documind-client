import { X } from 'lucide-react'
import { useState } from 'react'

interface TagsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
}

export function TagsInput({ tags, onChange, placeholder = 'Add tag...', label }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className='flex flex-col gap-1'>
      {label && <label className='font-semibold text-sm'>{label}</label>}
      <div className='border rounded p-2 flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <span key={tag} className='bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 flex items-center gap-1'>
            {tag}
            <button type='button' onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              <X className='h-3 w-3' />
            </button>
          </span>
        ))}
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className='flex-grow min-w-[120px] outline-none border-none bg-transparent'
        />
      </div>
    </div>
  )
}
