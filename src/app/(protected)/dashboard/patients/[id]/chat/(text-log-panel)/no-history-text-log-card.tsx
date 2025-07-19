import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquareWarning } from 'lucide-react'

const NoHistoryTextLogCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='flex flex-col items-center w-fit mx-auto justify-center gap-3 text-center  rounded-xl p-6 text-muted-foreground font-sans'>
      <MessageSquareWarning strokeWidth={1} className='w-18 h-18 text-muted-foreground/80' />
      <p className='text-sm font-medium'>No Chat log is added about this patient</p>
      <p className='text-xs text-muted-foreground leading-snug'>
        Start adding updates, current conditions
        <br />
        about this patient.
      </p>
    </motion.div>
  )
}

export default NoHistoryTextLogCard
