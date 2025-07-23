'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useMediaQuery } from '@/002-hooks/use-media-query'
import { usePatientDetails } from '@/002-hooks/use-patient'
import { TextLogPanel } from './(text-log-panel)/text-log-panel'
import { VoicePanel } from './(voice-log-panel)/voice-log-panel'

import { IdCard, MessageSquare, Mic, Sparkles } from 'lucide-react'
import ClassicLoader from '@/components/classic-loader'
import { PatientDetailsCard } from './patient-details-card'
import { useAuthStore } from '@/store/auth-store'
import { usePreferenceStore } from '@/store/preference-store'
import { AiAssitantPanel } from './(ai-assistant-panel)/ai-assistant-panel'

export default function PatientChatPage() {
  const { id } = useParams<{ id: string }>()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { getPatientTab, setPatientTab } = usePreferenceStore()
  const [tab, setTab] = useState<'chat' | 'voice' | 'ai'>(() => {
    const saved = getPatientTab(id)
    return saved ?? 'voice'
  })
  const doctor = useAuthStore((s) => s.doctor)
  const doctorId = doctor?.id

  const { data: patient, isLoading, isError } = usePatientDetails(id)
  console.log(patient)

  if (isError) return <div className='p-8 text-destructive'>Error loading patient.</div>
  if (isLoading || !patient) {
    return (
      <div className='p-8 flex justify-center items-center font-sans h-[60vh]'>
        <ClassicLoader size='sm' className='w-8 h-8' />
        <span className='sr-only'>Loading…</span>
      </div>
    )
  }

  // --- MOBILE ---

  if (isMobile) {
    return (
      <div className='h-[calc(100vh-100px)] flex flex-col bg-background font-sans overflow-hidden'>
        <Tabs defaultValue='details' className='flex-1 flex flex-col min-h-0 overflow-hidden'>
          <TabsList className='ml-2 mt-4 mb-2'>
            <TabsTrigger value='details'>
              <IdCard className='w-4 h-4 mr-1' />
              Details
            </TabsTrigger>
            <TabsTrigger value='chat'>
              <MessageSquare className='w-4 h-4 mr-1' />
              Chat
            </TabsTrigger>
          </TabsList>
          <TabsContent value='details'>
            <PatientDetailsCard patient={patient} />
          </TabsContent>
          <TabsContent value='chat' className='px-2 flex-1 flex flex-col min-h-0 overflow-hidden'>
            <Tabs
              value={tab}
              onValueChange={(value: string) => {
                const tabValue = value as 'chat' | 'voice' | 'ai'
                setTab(tabValue)
                setPatientTab(id, tabValue)
              }}
              className='flex-1 flex flex-col min-h-0 overflow-hidden'>
              <TabsList>
                <TabsTrigger value='chat'>
                  <MessageSquare className='w-4 h-4 mr-1' />
                  Add Text Log
                </TabsTrigger>
                <TabsTrigger value='voice'>
                  <Mic className='w-4 h-4 mr-1' />
                  Add Voice Log
                </TabsTrigger>
                <TabsTrigger value='ai'>
                  <Sparkles className='w-4 h-4 mr-1' />
                  Ask AI Assistant
                </TabsTrigger>
              </TabsList>
              <TabsContent value='chat' className='flex-1 min-h-0 overflow-y-auto'>
                <TextLogPanel patientId={id} doctorId={doctorId} conversationType='doctor_only' />
              </TabsContent>
              <TabsContent value='voice' className='flex-1 min-h-0 overflow-y-auto'>
                <VoicePanel patientId={id} doctorId={doctorId!} />
              </TabsContent>
              <TabsContent value='ai' className='flex-1 min-h-0 overflow-y-auto'>
                <AiAssitantPanel patientId={id} doctorId={doctorId!} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // --- DESKTOP ---
  return (
    <div className='h-[calc(100vh-100px)] flex bg-background font-sans overflow-hidden'>
      <aside className='w-[540px] min-w-[480px] max-w-xs border rounded-xl bg-sidebar-accent h-full flex-shrink-0 flex flex-col'>
        <div className='p-5 overflow-y-auto flex-1'>
          <PatientDetailsCard patient={patient} />
        </div>
      </aside>

      <main className='flex-1 flex flex-col min-h-0 overflow-hidden px-6'>
        <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
          <Tabs
            value={tab}
            onValueChange={(value: string) => {
              const tabValue = value as 'chat' | 'voice' | 'ai'
              setTab(tabValue)
              setPatientTab(id, tabValue)
            }}
            className='flex-1 flex flex-col min-h-0 overflow-hidden'>
            <TabsList>
              <TabsTrigger value='chat'>
                <MessageSquare className='w-4 h-4 mr-1' /> Add Text Log
              </TabsTrigger>
              <TabsTrigger value='voice'>
                <Mic className='w-4 h-4 mr-1' />
                Add Voice Log
              </TabsTrigger>
              <TabsTrigger value='ai'>
                <Sparkles className='w-4 h-4 mr-1' /> Ask AI Assistant
              </TabsTrigger>
            </TabsList>
            <TabsContent value='chat' className='flex-1 min-h-0 overflow-y-auto'>
              <TextLogPanel patientId={id} doctorId={doctorId} conversationType='doctor_only' />
            </TabsContent>
            <TabsContent value='voice' className='flex-1 min-h-0 overflow-y-auto'>
              <VoicePanel patientId={id} doctorId={doctorId!} />
            </TabsContent>
            <TabsContent value='ai' className='flex-1 min-h-0 overflow-y-auto'>
              <AiAssitantPanel patientId={id} doctorId={doctorId!} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
