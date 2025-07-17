// components/patient/record-chat-switch.tsx
'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MessageSquare, Mic } from 'lucide-react'

interface RecordChatSwitchProps {
  value: 'chat' | 'record'
  onChange: (val: 'chat' | 'record') => void
}
export function RecordChatSwitch({ value, onChange }: RecordChatSwitchProps) {
  return (
    <ToggleGroup
      type='single'
      value={value}
      onValueChange={(val) => onChange((val as 'chat' | 'record') || 'chat')}
      className='w-full'>
      <ToggleGroupItem value='chat' className='flex-1' aria-label='Chat'>
        <MessageSquare className='w-4 h-4 mr-2' /> Chat
      </ToggleGroupItem>
      <ToggleGroupItem value='record' className='flex-1' aria-label='Record'>
        <Mic className='w-4 h-4 mr-2' /> Record
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
