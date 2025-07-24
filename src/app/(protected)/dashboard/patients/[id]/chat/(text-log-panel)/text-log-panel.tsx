'use client'

import React, { FC, useEffect, useRef, UIEvent, useState } from 'react'
import { usePatientChat, useSendPatientChat } from '@/002-hooks/use-conversation'
import { usePatientMessagesStore } from '@/store/patient-message-store'
import type { ChatMessage, ChatMessageInput } from '@/types'
import ClassicLoader from '@/components/classic-loader'
import { ArrowDown, ArrowUp, CheckCircle2, XCircle, Loader, RotateCcw } from 'lucide-react'
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input'
import { Button } from '@/components/ui/button'
import { groupMessagesByDate, formatDateHeader, formatTime } from '@/utils/chat-conversation'
import { useQueryClient } from '@tanstack/react-query'
import NoHistoryTextLogCard from '@/app/(protected)/dashboard/patients/[id]/chat/(text-log-panel)/no-history-text-log-card'

interface TextLogPanelProps {
  patientId: string
  doctorId: string | undefined
  conversationType: string
}

export const TextLogPanel: FC<TextLogPanelProps> = ({ patientId, doctorId, conversationType }) => {
  const { data: queryData, isLoading } = usePatientChat(patientId)
  const setChatMessages = usePatientMessagesStore((s) => s.setChatMessages)
  const chatFromStore = usePatientMessagesStore((s) => s.chatMessages[patientId])
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (container && chatMessages.length > 0 && atBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, atBottom])

  useEffect(() => {
    const container = containerRef.current
    if (container && chatMessages.length > 0) {
      container.scrollTop = container.scrollHeight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const grouped = groupMessagesByDate(chatMessages)
  const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  function retryMessage(msg: ChatMessage) {
    if (!doctorId) return

    client.setQueryData<ChatMessage[]>(['patientChat', patientId], (old) => {
      if (!old) return []
      return old.map((m) => (m.id === msg.id ? { ...m, status: 'pending' } : m))
    })

    sendMutation.mutate(
      {
        patientId,
        doctorId,
        conversationType,
        fullTranscript: msg.fullTranscript,
        optimisticId: msg.id,
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
      <div className='bg-muted text-muted-foreground text-center px-4 py-2 text-xs border-b rounded-tl-md rounded-tr-md'>
        You can add any logs about the patient here.
      </div>

      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto p-4 relative'>
        {isLoading ? (
          <div className='flex justify-center py-6'>
            <ClassicLoader className='w-5 h-5' />
          </div>
        ) : chatMessages.length === 0 ? (
          <NoHistoryTextLogCard />
        ) : (
          dates.map((dateStr) => (
            <div key={dateStr} className='mb-8 relative'>
              <div className='flex justify-center mb-3'>
                <span className='text-xs font-mono bg-muted px-3 py-1 rounded-xl'>{formatDateHeader(dateStr)}</span>
              </div>

              <div className='relative pl-6'>
                <div className='absolute left-[11px] top-0 bottom-0 w-px bg-muted-foreground/20' />

                {grouped[dateStr].map((msg, i) => (
                  <div key={msg.id} className='relative mb-5'>
                    <div className='absolute -left-4 top-0 w-2 h-2 bg-primary rounded-full z-10' />
                    <div className='inline-block bg-muted px-3 py-2 rounded-md text-sm text-foreground max-w-[80%] shadow'>
                      {msg.fullTranscript}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-mono ml-1'>
                      <span>{formatTime(msg.timestamp)}</span>

                      {msg.status === 'pending' && <Loader className='w-3.5 h-3.5 animate-spin' />}
                      {msg.status === 'sent' && <CheckCircle2 className='w-3.5 h-3.5 text-green-500' />}
                      {msg.status === 'failed' && (
                        <>
                          <XCircle className='w-3.5 h-3.5 text-red-500' />
                          <button
                            onClick={() => retryMessage(msg)}
                            className='flex items-center gap-1 text-red-500 border border-red-500 rounded-full px-2 py-0.5 text-xs font-sans hover:bg-red-50 transition'>
                            <RotateCcw className='w-3 h-3' />
                            Retry
                          </button>
                        </>
                      )}
                    </div>
                    {i === grouped[dateStr].length - 1 && dateStr === dates[dates.length - 1] && <div ref={endRef} />}
                  </div>
                ))}
              </div>
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
