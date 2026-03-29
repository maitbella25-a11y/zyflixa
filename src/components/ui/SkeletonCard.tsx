import React from 'react'

export const SkeletonCard: React.FC = () => (
  <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[185px] lg:w-[200px] animate-pulse">
    <div className="aspect-[2/3] rounded-md bg-zinc-800 mb-2" />
    <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-1.5" />
    <div className="h-3 bg-zinc-800 rounded w-1/2" />
  </div>
)
