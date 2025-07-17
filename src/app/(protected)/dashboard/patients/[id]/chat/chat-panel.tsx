// components/ChatPanel.tsx
'use client'

import React, { FC, useEffect, useRef, UIEvent, useState } from 'react'
import { usePatientChat, useSendPatientChat } from '@/hooks/use-conversation'
import { usePatientMessagesStore } from '@/store/patient-message-store'
import type { ChatMessage, ChatMessageInput } from '@/types'
import ClassicLoader from '@/components/classic-loader'
import { ArrowDown, ArrowUp, CheckCircle2, XCircle, Loader } from 'lucide-react'
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input'
import { Button } from '@/components/ui/button'
import { groupMessagesByDate, formatDateHeader, formatTime } from '@/utils/chat-conversation'

interface ChatPanelProps {
  patientId: string
  doctorId: string | undefined
  conversationType: string
}

export const ChatPanel: FC<ChatPanelProps> = ({ patientId, doctorId, conversationType }) => {
  const { data: queryData, isLoading } = usePatientChat(patientId)
  const setChatMessages = usePatientMessagesStore((s) => s.setChatMessages)
  const chatFromStore = usePatientMessagesStore((s) => s.chatMessages[patientId])
  const chatMessages: ChatMessage[] = chatFromStore ?? []

  const [input, setInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const sendMutation = useSendPatientChat(patientId)

  useEffect(() => {
    if (queryData) setChatMessages(patientId, queryData)
  }, [queryData, patientId, setChatMessages])

  useEffect(() => {
    const container = containerRef.current
    if (container && chatMessages.length > 0) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 300
    setAtBottom(isAtBottom)
  }

  function send() {
    if (!input.trim() || sendMutation.isPending || !doctorId) return
    const payload: ChatMessageInput = {
      patientId,
      doctorId,
      conversationType,
      fullTranscript: input.trim(),
    }
    sendMutation.mutate(payload, { onSuccess: () => setInput('') })
  }

  // group & sort
  const grouped = groupMessagesByDate(chatMessages)
  const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className='flex flex-col h-full min-h-0 bg-background rounded-lg border font-sans'>
      <div className='bg-yellow-100 text-yellow-900 px-4 py-2 text-xs border-b'>
        Doctor ↔︎ AI only. AI will <strong>not</strong> reply here.
      </div>

      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto p-4'>
        {isLoading ? (
          <div className='flex justify-center py-6'>
            <ClassicLoader className='w-5 h-5' />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className='text-center text-muted-foreground my-6'>No messages yet</div>
        ) : (
          dates.map((dateStr) => (
            <div key={dateStr}>
              <div className='flex justify-center mb-2'>
                <span className='text-xs font-mono bg-muted px-3 py-1 rounded-xl'>{formatDateHeader(dateStr)}</span>
              </div>
              {grouped[dateStr].map((msg, i) => (
                <div key={msg.id} className='flex flex-col items-end mb-2'>
                  <div className='relative max-w-xs bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-lg shadow'>
                    {msg.fullTranscript}
                  </div>
                  <div className='flex items-center gap-1 mt-1 text-[11px] font-mono text-muted-foreground'>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.status === 'pending' && <Loader className='w-4 h-4 animate-spin' />}
                    {msg.status === 'sent' && <CheckCircle2 className='w-4 h-4 text-green-500' />}
                    {msg.status === 'failed' && <XCircle className='w-4 h-4 text-red-500' />}
                  </div>

                  {i === grouped[dateStr].length - 1 && dateStr === dates[dates.length - 1] && <div ref={endRef} />}
                </div>
              ))}
            </div>
          ))
        )}

        {!atBottom && (
          <Button
            type='button'
            variant='secondary'
            onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className='absolute left-0 right-0 mx-auto bottom-32 w-10 h-10 rounded-full'>
            <ArrowDown className='w-5 h-5' />
          </Button>
        )}
      </div>

      <PromptInput
        value={input}
        onValueChange={setInput}
        onSubmit={send}
        isLoading={sendMutation.isPending}
        className='border-t m-4 rounded-lg'>
        <div className='flex items-end gap-2'>
          <PromptInputTextarea placeholder='Type message…' />
          <PromptInputActions>
            <PromptInputAction tooltip='Send'>
              <button
                type='submit'
                className='p-2 rounded-full bg-primary text-primary-foreground'
                disabled={!input.trim() || sendMutation.isPending || !doctorId}>
                {sendMutation.isPending ? <ClassicLoader className='w-5 h-5' /> : <ArrowUp className='w-5 h-5' />}
              </button>
            </PromptInputAction>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  )
}
