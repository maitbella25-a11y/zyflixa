import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

describe('cn - Tailwind class merger', () => {
  it('should merge multiple classes', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle conditional classes', () => {
    const result = cn('px-2', true && 'py-1', false && 'py-2')
    expect(result).toBe('px-2 py-1')
  })

  it('should handle undefined and null values', () => {
    const result = cn('px-2', undefined, null, 'py-1')
    expect(result).toBe('px-2 py-1')
  })

  it('should handle object notation', () => {
    const result = cn({ 'px-2': true, 'py-1': false })
    expect(result).toBe('px-2')
  })

  it('should resolve Tailwind conflicts correctly', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('should preserve important classes', () => {
    const result = cn('px-2 !px-4')
    expect(result).toContain('!px-4')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle arrays', () => {
    const result = cn(['px-2 py-1', 'px-4'])
    expect(result).toBe('py-1 px-4')
  })
})
