import { useEffect, useState } from 'react'
import { getDashboardMetrics } from '../lib/api'
import { useAuth } from '../features/auth/useAuth'
import {
  HomeDashboardWidgets,
  HomeDashboardWidgetsSkeleton,
} from '../components/home/HomeDashboardWidgets'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { PageHeader } from '../components/ui/PageHeader'
import type { DashboardMetrics } from '../types/domain'

export function DashboardPage() {
  const { session } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!session) {
      return
    }

    const currentSession = session
    let cancelled = false

    async function run() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getDashboardMetrics(currentSession.access_token)
        if (!cancelled) {
          setMetrics(result)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load dashboard metrics',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [session, retryCount])

  if (isLoading && !metrics) {
    return (
      <section className="lift-page">
        <PageHeader
          title="Home"
          description="Each card is tappable and opens the full page for that habit."
        />
        <HomeDashboardWidgetsSkeleton />
        <p className="pt-4 text-center text-xs font-medium text-[var(--lift-text-muted)]">
          Loading your dashboard…
        </p>
      </section>
    )
  }

  if (error && !metrics) {
    return (
      <section className="lift-page space-y-4">
        <PageHeader
          title="Home"
          description="Each card is tappable and opens the full page for that habit."
        />
        <ErrorAlert message={error} />
        <button
          className="lift-btn-secondary px-4 py-2.5 text-sm"
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Try again
        </button>
      </section>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <section className="lift-page">
      <PageHeader
        title="Home"
        description="Each card opens the full section for workouts, weigh-ins, or steps."
      />

      {error ? <ErrorAlert message={error} /> : null}

      <HomeDashboardWidgets metrics={metrics} />
    </section>
  )
}
