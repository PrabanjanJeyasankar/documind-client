import React from 'react'

function HistoryLoadingSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(2)].map((_, i) => (
        <div key={i} className='flex flex-col gap-1 mb-4'>
          {/* User bubble shimmer */}
          <div className='flex justify-end'>
            <div className='h-10 w-42 rounded-2xl rounded-tr-none bg-gradient-to-r from-primary/10 via-white/40 to-primary/10 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]' />
          </div>

          {/* AI bubble shimmer */}
          <div className='flex justify-start'>
            <div className='h-10 w-48 rounded-2xl rounded-tl-none bg-gradient-to-r from-primary/10 via-white/40 to-primary/10 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default HistoryLoadingSkeleton
