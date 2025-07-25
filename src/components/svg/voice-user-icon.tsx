import React, { FC, SVGProps } from 'react'

export type VoiceUserIconProps = SVGProps<SVGSVGElement>

export const VoiceUserIcon: FC<VoiceUserIconProps> = ({ width = 48, height = 48, viewBox = '0 0 48 48', ...props }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox={viewBox} {...props}>
    <g fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth={4}>
      <path fill='currentColor' d='M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14' />
      <path d='M33 8s2.25 4.5 0 10m7-14s4.5 8.1 0 18' />
      <path
        fill='currentColor'
        d='M4 40.8V42h30v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C27.92 28 25.68 28 21.2 28h-4.4c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C4 34.08 4 36.32 4 40.8'
      />
    </g>
  </svg>
)

export default VoiceUserIcon
