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

function DashboardLoadErrorHelp({ isDev }: { isDev: boolean }) {
  if (isDev) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-[var(--lift-text)]">
        <p className="font-medium">Vite dev server cannot run these API routes.</p>
        <p className="mt-2 text-[var(--lift-text-muted)]">
          From the project folder run{' '}
          <code className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">
            npx vercel dev
          </code>{' '}
          (with Vercel CLI and env set), or test Home on your deployed URL where{' '}
          <code className="rounded bg-black/10 px-1.5 py-0.5 text-xs dark:bg-white/10">
            /api/*
          </code>{' '}
          exists.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--lift-border)] bg-[var(--lift-surface-2)] px-4 py-3 text-sm text-[var(--lift-text-muted)]">
      <p className="font-medium text-[var(--lift-text)]">Server / database checks</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          Open{' '}
          <a
            className="font-medium text-[var(--lift-accent)] underline"
            href="/api/health"
            target="_blank"
            rel="noreferrer"
          >
            /api/health
          </a>{' '}
          in a new tab. If <code className="text-xs">ok</code> is false, fix{' '}
          <code className="text-xs">DATABASE_URL</code> in Vercel (Production) and redeploy.
        </li>
        <li>
          Prefer Supabase <strong>connection pooling</strong> → <strong>Transaction</strong>{' '}
          URI (often port <code className="text-xs">6543</code> with{' '}
          <code className="text-xs">pgbouncer=true</code>) for serverless.
        </li>
        <li>
          Set <code className="text-xs">SUPABASE_URL</code> and{' '}
          <code className="text-xs">SUPABASE_ANON_KEY</code> for Production (API auth needs
          them).
        </li>
        <li>
          Run <code className="text-xs">npx prisma migrate deploy</code> once against that same
          database.
        </li>
      </ul>
    </div>
  )
}

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
        <DashboardLoadErrorHelp isDev={import.meta.env.DEV} />
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
