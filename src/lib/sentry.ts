import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

export const initSentry = () => {
  // Only initialize Sentry in production
  if (import.meta.env.PROD) {
    Sentry.init({
      // Replace with your actual Sentry DSN
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        // Filter out certain errors
        if (event.exception) {
          const error = event.exception.values?.[0]?.value
          // Ignore network errors in production
          if (error?.includes('Network Error')) {
            return null
          }
        }
        return event
      },
    })
  }
}

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      contexts: {
        app: context,
      },
    })
  } else {
    console.error('Development error:', error, context)
  }
}

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level)
  }
}

export const withProfiler = (name: string) => {
  return import.meta.env.PROD ? Sentry.withProfiler : (component: any) => component
}
