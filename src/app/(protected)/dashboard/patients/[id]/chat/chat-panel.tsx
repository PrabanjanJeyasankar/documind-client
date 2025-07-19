// components/ChatPanel.tsx
'use client'

import React, { FC, useEffect, useRef, UIEvent, useState } from 'react'
import { usePatientChat, useSendPatientChat } from '@/hooks/use-conversation'
import { usePatientMessagesStore } from '@/store/patient-message-store'
import type { ChatMessage, ChatMessageInput } from '@/types'
import ClassicLoader from '@/components/classic-loader'
import { ArrowDown, ArrowUp, CheckCircle2, XCircle, Loader, RotateCcw } from 'lucide-react'
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input'
import { Button } from '@/components/ui/button'
import { groupMessagesByDate, formatDateHeader, formatTime } from '@/utils/chat-conversation'
import { useQueryClient } from '@tanstack/react-query'
import NoChatLogCard from '@/components/no-chat-log-card'

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
  const client = useQueryClient()
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
      onOptimisticSend: () => setInput(''),
    }
    sendMutation.mutate(payload, { onSuccess: () => setInput(''), onError: () => setInput('') })
  }

  // group & sort
  const grouped = groupMessagesByDate(chatMessages)
  const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  function retryMessage(msg: ChatMessage) {
    if (!doctorId) return

    // 1. Set message back to pending in cache
    client.setQueryData<ChatMessage[]>(['patientChat', patientId], (old) => {
      if (!old) return []
      return old.map((m) => (m.id === msg.id ? { ...m, status: 'pending' } : m))
    })

    // 2. Reuse the same ID during retry
    sendMutation.mutate(
      {
        patientId,
        doctorId,
        conversationType,
        fullTranscript: msg.fullTranscript,
        optimisticId: msg.id, // 👈 crucial part
      },
      {
        onError: () => {
          client.setQueryData<ChatMessage[]>(['patientChat', patientId], (old) => {
            if (!old) return []
            return old.map((m) => (m.id === msg.id ? { ...m, status: 'failed' } : m))
          })
        },
      }
    )
  }

  return (
    <div className='flex flex-col h-full min-h-0 bg-background rounded-lg border font-sans'>
      <div className='bg-yellow-100 text-yellow-900 text-center px-4 py-2 text-xs border-b'>
        Doctors can only add logs. AI will <strong>not</strong> reply here!
      </div>

      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto p-4'>
        {isLoading ? (
          <div className='flex justify-center py-6'>
            <ClassicLoader className='w-5 h-5' />
          </div>
        ) : chatMessages.length === 0 ? (
          <NoChatLogCard />
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

                    {msg.status === 'failed' && (
                      <div className='flex items-center gap-2'>
                        <XCircle className='w-4 h-4 text-red-500' />
                        <button
                          onClick={() => retryMessage(msg)}
                          className='flex items-center gap-1 text-red-500 border border-red-500 rounded-full px-2 py-0.5 text-xs font-sans hover:bg-red-50 transition'>
                          <RotateCcw className='w-3 h-3' />
                          Retry
                        </button>
                      </div>
                    )}
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
                disabled={!input.trim() || !doctorId}>
                {sendMutation.isPending ? (
                  <Loader className='w-5 h-5 text-muted-foreground' />
                ) : (
                  <ArrowUp className='w-5 h-5' />
                )}
              </button>
            </PromptInputAction>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  )
}
