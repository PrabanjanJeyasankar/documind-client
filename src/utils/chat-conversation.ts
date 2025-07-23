import { parseISO } from 'date-fns'

export function groupMessagesByDate<T extends { timestamp: string }>(messages: T[]) {
  const groups: { [date: string]: T[] } = {}
  messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
  })
  return groups
}

export function formatDateHeader(dateStr: string): string {
  const today = new Date()
  const date = new Date(dateStr)
  if (date.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString()
}

export function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

export function formatDuration(seconds: number): string {
  // make sure we have a non-negative whole number
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  // pad seconds under 10 with a leading zero
  const secsStr = secs.toString().padStart(2, '0')
  return `${mins}:${secsStr}`
}

export function calculateAgeFromDate(dateString: string): number | null {
  try {
    const today: Date = new Date()
    const birth: Date = parseISO(dateString)

    let age: number = today.getFullYear() - birth.getFullYear()
    const monthDiff: number = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }

    return age
  } catch {
    return null
  }
}
