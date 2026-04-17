import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

// Mock console.error to suppress error output in tests
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should render fallback UI when error is caught', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/Test error/)).toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom Error UI</div>

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
  })

  it('should have a "Go Home" button in default fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    const button = screen.getByRole('button', { name: /Go Home/i })
    expect(button).toBeInTheDocument()
  })

  afterEach(() => {
    consoleErrorSpy.mockClear()
  })
})
