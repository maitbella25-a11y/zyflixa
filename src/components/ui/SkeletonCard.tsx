import React from 'react'

export const SkeletonCard: React.FC = () => (
  <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[185px] lg:w-[200px]">
    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-800 mb-2">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.8s_infinite]"
        style={{ backgroundSize: '200% 100%' }} />
    </div>
    <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-1.5 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.8s_infinite]" />
    </div>
    <div className="h-3 bg-zinc-800 rounded w-1/2 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.8s_infinite]" />
    </div>
  </div>
)
