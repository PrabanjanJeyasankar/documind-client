'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessagesSquare } from 'lucide-react'

const NoInteractionCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='flex flex-col items-center w-fit mx-auto justify-center gap-3 text-center  rounded-xl p-6 text-muted-foreground font-sans'>
      <MessagesSquare strokeWidth={0.7} className='w-18 h-18 text-muted-foreground' />
      <p className='text-sm font-medium'>No interaction made with AI</p>
      <p className='text-xs text-muted-foreground leading-snug'>
        Start a chat with the assistant to ask questions
        <br />
        about this patient.
      </p>
    </motion.div>
  )
}

export default NoInteractionCard
