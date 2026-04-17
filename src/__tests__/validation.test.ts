import { describe, it, expect } from 'vitest'
import {
  SearchQuerySchema,
  MediaIdSchema,
  MediaTypeSchema,
  safeParseSearchQuery,
  safeParseMediaId,
  safeParseMediaType,
} from '../lib/validation'

describe('Validation Schemas', () => {
  describe('SearchQuerySchema', () => {
    it('should accept valid search queries', () => {
      const result = SearchQuerySchema.safeParse({ q: 'Inception' })
      expect(result.success).toBe(true)
    })

    it('should reject empty search queries', () => {
      const result = SearchQuerySchema.safeParse({ q: '' })
      expect(result.success).toBe(false)
    })

    it('should reject queries longer than 256 characters', () => {
      const longQuery = 'a'.repeat(257)
      const result = SearchQuerySchema.safeParse({ q: longQuery })
      expect(result.success).toBe(false)
    })

    it('should trim whitespace', () => {
      const result = SearchQuerySchema.safeParse({ q: '  Inception  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.q).toBe('Inception')
      }
    })
  })

  describe('MediaIdSchema', () => {
    it('should accept positive integers', () => {
      const result = MediaIdSchema.safeParse(550)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(550)
      }
    })

    it('should reject negative numbers', () => {
      const result = MediaIdSchema.safeParse(-1)
      expect(result.success).toBe(false)
    })

    it('should reject zero', () => {
      const result = MediaIdSchema.safeParse(0)
      expect(result.success).toBe(false)
    })

    it('should coerce string numbers', () => {
      const result = MediaIdSchema.safeParse('550')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(550)
      }
    })
  })

  describe('MediaTypeSchema', () => {
    it('should accept valid media types', () => {
      expect(MediaTypeSchema.safeParse('movie').success).toBe(true)
      expect(MediaTypeSchema.safeParse('tv').success).toBe(true)
      expect(MediaTypeSchema.safeParse('anime').success).toBe(true)
    })

    it('should reject invalid media types', () => {
      const result = MediaTypeSchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })
  })

  describe('Safe parsers', () => {
    it('safeParseSearchQuery should handle errors gracefully', () => {
      const result = safeParseSearchQuery(null)
      expect(result.success).toBe(false)
    })

    it('safeParseMediaId should handle non-numeric values', () => {
      const result = safeParseMediaId('invalid')
      expect(result.success).toBe(false)
    })

    it('safeParseMediaType should handle invalid types', () => {
      const result = safeParseMediaType('series')
      expect(result.success).toBe(false)
    })
  })
})
