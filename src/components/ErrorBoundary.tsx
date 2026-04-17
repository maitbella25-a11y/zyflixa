import React, { ReactNode, ReactElement } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactElement
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center gap-6 pt-16 px-4">
            <div className="text-center">
              <div className="text-6xl font-black text-[#E50914] mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-zinc-400 mb-4 max-w-md">{this.state.error?.message}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-[#E50914] text-white font-bold px-6 py-3 rounded-md hover:bg-[#B20710] transition-all text-sm inline-block"
              >
                Go Home
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
