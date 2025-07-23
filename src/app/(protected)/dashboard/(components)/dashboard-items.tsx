import { FileText, Plus, Users, FolderKanban } from 'lucide-react'
import type { DashboardTabItem } from '@/types'

export const DASHBOARD_TABS: DashboardTabItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: FileText,
    color: 'bg-[var(--color-primary)] hover:bg-[color-mix(in_oklch,var(--color-primary),black_15%)]',
    href: '/dashboard',
    content: (
      <div className='flex flex-col items-center justify-center h-full text-muted-foreground font-sans text-xl'>
        Coming soon
      </div>
    ),
  },
  {
    id: 'patients',
    title: 'Patients',
    icon: Users,
    color: 'bg-[var(--color-secondary)] hover:bg-[color-mix(in_oklch,var(--color-secondary),black_15%)]',
    href: '/dashboard/patients',
  },
  {
    id: 'record',
    title: 'Record',
    icon: Plus,
    color: 'bg-[var(--color-accent)] hover:bg-[color-mix(in_oklch,var(--color-accent),black_15%)]',
    href: '/dashboard/record',
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    icon: FolderKanban,
    color: 'bg-[var(--color-foreground)] hover:bg-[color-mix(in_oklch,var(--color-foreground),black_15%)]',
    href: '/dashboard/ai-assistant',
    content: (
      <div className='flex flex-col items-center justify-center h-full text-muted-foreground font-sans text-xl'>
        Coming soon
      </div>
    ),
  },
]
