'use client'

import React, { FC, useEffect, useRef, useState, UIEvent } from 'react'
import { useAiChatHistory, useSubmitAiQuestion } from '@/hooks/use-ai-chat'
import { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction } from '@/components/ui/prompt-input'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, Loader } from 'lucide-react'
import { ResponseStream } from '@/components/ui/response-stream'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ui/reasoning'
import { groupMessagesByDate, formatDateHeader, formatTime } from '@/utils/chat-conversation'
import { LocalAiMessage } from '@/types'
import { cn } from '@/lib/utils'
import HistoryLoadingSkeleton from './history-loading-skeleton'
import NoInteractionCard from './no-interaction-card'

interface AiAssistantPanelProps {
  patientId: string
  doctorId: string
}

export const PatientAiPanel: FC<AiAssistantPanelProps> = ({ patientId, doctorId }) => {
  const { data: remoteMsgs, isLoading: isHistoryLoading } = useAiChatHistory(patientId)
  const sendMutation = useSubmitAiQuestion()
  const [localMsgs, setLocalMsgs] = useState<LocalAiMessage[]>([])
  const hasActivePending = localMsgs.some((msg) => msg.status === 'pending')
  const [atBottom, setAtBottom] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!remoteMsgs) return

    const remoteWithMeta: LocalAiMessage[] = remoteMsgs.map((m) => ({
      ...m,
      localId: m.id,
      status: 'sent',
      showCot: false,
      isFromHistory: true,
    }))

    setLocalMsgs((prev) => {
      const seen = new Set(remoteWithMeta.map((m) => m.id))
      const pendingOrNew = prev.filter((m) => m.status !== 'sent' || !seen.has(m.id))

      return [...remoteWithMeta, ...pendingOrNew]
    })
  }, [remoteMsgs, patientId])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [remoteMsgs, localMsgs.length])

  function handleScroll(e: UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 300)
  }

  function send() {
    if (!input.trim() || hasActivePending || sendMutation.isPending) return

    const prompt = input.trim()
    const localId = `local-${Date.now()}`

    const newLocal: LocalAiMessage = {
      id: localId,
      localId,
      query: prompt,
      thought: '',
      answer: '',
      createdAt: new Date().toISOString(),
      status: 'pending',
      showCot: false,
    }

    setLocalMsgs((prev) => [...prev, newLocal])
    setInput('')

    sendMutation.mutate(
      { query: prompt, doctorId, patientId },
      {
        onSuccess: (res) => {
          console.log('[AI RAW RESPONSE]', res)
          let parsedThought = res.thought
          let parsedAnswer = res.answer

          try {
            const match = res.answer.match(/```json\s*([\s\S]+?)\s*```/)

            if (match && match[1]) {
              const json = JSON.parse(match[1])
              parsedThought = json.thought ?? ''
              parsedAnswer = json.answer ?? res.answer
              console.log('[AI PARSED JSON]', { parsedThought, parsedAnswer })
            }
          } catch (err) {
            console.error('[AI RESPONSE PARSE ERROR]', err)
          }

          setLocalMsgs((prev) =>
            prev.map((m) =>
              m.localId === localId
                ? {
                    ...m,
                    id: res.conversationId,
                    status: 'sent',
                    localId: res.conversationId,
                    thought: parsedThought,
                    answer: parsedAnswer,
                  }
                : m
            )
          )
        },
        onError: () => {
          setLocalMsgs((prev) => prev.map((m) => (m.localId === localId ? { ...m, status: 'failed' } : m)))
        },
      }
    )
  }

  const allMsgs: LocalAiMessage[] = localMsgs

  const grouped = groupMessagesByDate(allMsgs.map((m) => ({ ...m, timestamp: m.createdAt })))
  const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <div className='flex flex-col h-full min-h-0 bg-background rounded-lg border font-sans'>
      <div className='bg-muted text-muted-foreground px-4 py-2 text-xs border-b'>
        AI Assistant — will answer your medical queries.
      </div>

      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto p-4'>
        {isHistoryLoading && allMsgs.length === 0 ? (
          <HistoryLoadingSkeleton />
        ) : allMsgs.length === 0 ? (
          <NoInteractionCard />
        ) : (
          dates.map((dateStr) => (
            <div key={dateStr}>
              <div className='flex justify-center mb-2'>
                <span className='text-xs font-mono bg-muted px-3 py-1 rounded-xl'>{formatDateHeader(dateStr)}</span>
              </div>

              {grouped[dateStr].map((msg, i) => {
                return (
                  <div key={msg.localId} className='flex flex-col gap-1 mb-4'>
                    {/* Query bubble */}
                    <div className='flex justify-end'>
                      <div className='relative max-w-xs bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-none shadow'>
                        {msg.query}
                      </div>
                    </div>

                    {/* AI response */}
                    <div className='flex justify-start'>
                      <div
                        className={cn(
                          'max-w-xs rounded-2xl rounded-tl-none text-sm border-none mt-2',
                          msg.answer !== 'pending' && 'bg-muted',
                          msg.answer === 'pending' || (msg.thought && msg.answer) ? 'p-4' : 'p-0'
                        )}>
                        {/* {true ? ( */}
                        {msg.status === 'pending' ? (
                          <div className='flex justify-start'>
                            <div className='h-10 w-48 rounded-2xl rounded-tl-none bg-gradient-to-r from-primary/10 via-white/40 to-primary/10 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]' />
                          </div>
                        ) : (
                          <>
                            {msg.thought && (
                              <>
                                <Reasoning
                                  open={msg.showCot}
                                  onOpenChange={(open) =>
                                    setLocalMsgs((prev) =>
                                      prev.map((m) => (m.localId === msg.localId ? { ...m, showCot: open } : m))
                                    )
                                  }
                                  isStreaming={!msg.isFromHistory}>
                                  <ReasoningTrigger>Show reasoning</ReasoningTrigger>
                                  <ReasoningContent className='ml-2 border-l px-2 py-1 border-border'>
                                    {msg.thought}
                                  </ReasoningContent>
                                </Reasoning>
                              </>
                            )}

                            <div className={cn(msg.showCot && 'mt-4')}>
                              <ResponseStream
                                textStream={msg.answer}
                                mode={msg.isFromHistory ? 'static' : 'typewriter'}
                                speed={20}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* timestamp */}
                    {msg.status !== 'pending' && (
                      <div className='flex justify-start text-[11px] font-mono text-muted-foreground ml-1'>
                        {formatTime(msg.createdAt)}
                      </div>
                    )}

                    {/* autoscroll anchor */}
                    {i === grouped[dateStr].length - 1 && dateStr === dates[dates.length - 1] && <div ref={endRef} />}
                  </div>
                )
              })}
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

      {/* input */}
      <PromptInput
        value={input}
        onValueChange={setInput}
        onSubmit={send}
        isLoading={sendMutation.isPending}
        className='border-t m-4 rounded-lg'>
        <div className='flex items-end gap-2'>
          <PromptInputTextarea placeholder='Ask AI about your patient' />
          <PromptInputActions>
            <PromptInputAction tooltip='Send'>
              <button
                type='button'
                onClick={send}
                className='p-2 rounded-full bg-primary text-primary-foreground'
                disabled={!input.trim() || hasActivePending || sendMutation.isPending}>
                {sendMutation.isPending ? <Loader className='w-4 h-4 animate-spin' /> : <ArrowUp className='w-5 h-5' />}
              </button>
            </PromptInputAction>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  )
}
