import type { VoiceRecording } from '@/types'

export function groupVoiceByDate(recordings: VoiceRecording[]): Record<string, VoiceRecording[]> {
  return recordings.reduce<Record<string, VoiceRecording[]>>((acc, rec) => {
    const date = new Date(rec.timestamp).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(rec)
    return acc
  }, {})
}
