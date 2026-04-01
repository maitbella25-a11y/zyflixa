/**
 * Shell — Mobile-responsive app layout.
 * Simple wrapper that provides sidebar + main content structure.
 */
import React, { useState } from 'react'

interface ShellProps {
  sidebar: React.ReactNode
  appName?: string
  children: React.ReactNode
}

export function Shell({ sidebar, appName = 'Zyflixa', children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — hidden on mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#141414] border-r border-zinc-800 transform transition-transform duration-200
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebar}
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-zinc-800 bg-[#141414] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
          <span className="font-semibold text-sm text-white">{appName}</span>
        </div>

        {children}
      </div>
    </div>
  )
}
