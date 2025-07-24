'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import { usePatientDetails } from '@/002-hooks/use-patient'
import { TextLogPanel } from './(text-log-panel)/text-log-panel'
import { VoicePanel } from './(voice-log-panel)/voice-log-panel'

import { MessageSquare, Mic, Sparkles } from 'lucide-react'
import ClassicLoader from '@/components/classic-loader'
import { PatientDetailsCard } from './patient-details-card'
import { useAuthStore } from '@/store/auth-store'
import { usePreferenceStore } from '@/store/preference-store'
import { AiAssitantPanel } from './(ai-assistant-panel)/ai-assistant-panel'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function PatientChatPage() {
  const { id } = useParams<{ id: string }>()
  const { getPatientTab, setPatientTab } = usePreferenceStore()
  const [tab, setTab] = useState<'chat' | 'voice' | 'ai'>(() => {
    const saved = getPatientTab(id)
    return saved ?? 'voice'
  })
  const doctor = useAuthStore((s) => s.doctor)
  const doctorId = doctor?.id

  const { data: patient, isLoading, isError } = usePatientDetails(id)

  if (isError) return <div className='p-8 text-destructive'>Error loading patient.</div>
  if (isLoading || !patient) {
    return (
      <div className='p-8 flex justify-center items-center font-sans h-[60vh]'>
        <ClassicLoader size='sm' className='w-8 h-8' />
        <span className='sr-only'>Loading…</span>
      </div>
    )
  }

  return (
    <div className='h-[calc(100vh-80px)] bg-background font-sans overflow-hidden'>
      <ResizablePanelGroup direction='horizontal' className='h-full w-full'>
        <ResizablePanel defaultSize={30} minSize={25} maxSize={35}>
          <div className='h-full bg-sidebar-accent rounded-xl overflow-y-auto scroll-thin-hover'>
            <PatientDetailsCard patient={patient} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} className='ml-2'>
          <div className='h-full overflow-hidden'>
            <Tabs
              value={tab}
              onValueChange={(value: string) => {
                const tabValue = value as 'chat' | 'voice' | 'ai'
                setTab(tabValue)
                setPatientTab(id, tabValue)
              }}
              className='h-full flex flex-col overflow-hidden'>
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

              <TabsContent value='chat' className='flex-1 overflow-y-auto'>
                <TextLogPanel patientId={id} doctorId={doctorId} conversationType='doctor_only' />
              </TabsContent>

              <TabsContent value='voice' className='flex-1 overflow-y-auto'>
                <VoicePanel patientId={id} doctorId={doctorId!} />
              </TabsContent>

              <TabsContent value='ai' className='flex-1 overflow-y-auto'>
                <AiAssitantPanel patientId={id} doctorId={doctorId!} />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
