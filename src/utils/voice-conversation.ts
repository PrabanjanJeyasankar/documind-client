import type { VoiceRecording } from '@/types'

export function groupVoiceByDate(recordings: VoiceRecording[]): Record<string, VoiceRecording[]> {
  return recordings.reduce<Record<string, VoiceRecording[]>>((acc, rec) => {
    const date = new Date(rec.timestamp).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(rec)
    return acc
  }, {})
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? ''
  const bstr = atob(arr[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new Blob([u8arr], { type: mime })
}
