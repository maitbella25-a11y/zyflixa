import React from 'react'
import { cn } from '../../lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={cn('relative', sizes[size], className)}>
      <div className={cn('absolute inset-0 rounded-full border-2 border-zinc-800')} />
      <div className={cn('absolute inset-0 rounded-full border-2 border-transparent border-t-[#E50914] animate-spin')} />
    </div>
  )
}
