export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='min-h-screen flex items-center justify-center px-4 bg-background text-foreground font-sans'>
      <div className='w-full max-w-md'>{children}</div>
    </main>
  )
}
