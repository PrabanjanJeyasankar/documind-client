// app/layout.tsx  (or app/root-layout.tsx — keep the same file name you already use)

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/query-provider'
import { Toaster } from 'sonner'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocuMind',
  description: 'AI-powered clinical assistant',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning /* ← and this */
      >
        <QueryProvider>
          {children}
          <Toaster richColors position='top-right' />
        </QueryProvider>
      </body>
    </html>
  )
}
