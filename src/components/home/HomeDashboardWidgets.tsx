import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import type { DashboardMetrics } from '../../types/domain'

/** Shown while dashboard metrics load — layout matches loaded widgets. */
export function HomeDashboardWidgetsSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-2">
      <div className="h-44 rounded-2xl bg-[var(--lift-surface-2)] sm:col-span-2 sm:h-40" />
      <div className="h-72 rounded-2xl bg-[var(--lift-surface-2)]" />
      <div className="h-72 rounded-2xl bg-[var(--lift-surface-2)]" />
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

function IconTrain({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M6 5h12v3H6V5Zm-2 5h4v8H4v-8Zm14 0h4v8h-4v-8Z"
        strokeLinejoin="round"
      />
      <path d="M8 10h8" strokeLinecap="round" />
    </svg>
  )
}

function IconScale({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M12 3a7 7 0 0 0-7 7v4h14v-4a7 7 0 0 0-7-7Z" />
      <path d="M5 17h14v3H5v-3Z" strokeLinecap="round" />
    </svg>
  )
}

function IconSteps({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M4 16h4l2-8 2 10 2-6h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Chevron() {
  return (
    <span
      aria-hidden
      className="text-lg font-bold text-[var(--lift-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--lift-accent)]"
    >
      →
    </span>
  )
}

type HomeDashboardWidgetsProps = {
  metrics: DashboardMetrics
}

export function HomeDashboardWidgets({ metrics }: HomeDashboardWidgetsProps) {
  const { totals, weightTrend, stepsTrend } = metrics

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        className={cn(
          'group lift-card max-w-none !p-0 no-underline transition active:scale-[0.99]',
          'border-violet-300/50 bg-gradient-to-br from-violet-100/90 via-white to-fuchsia-50/80',
          'dark:border-violet-500/25 dark:from-violet-950/55 dark:via-[var(--lift-surface)] dark:to-fuchsia-950/30',
          'sm:col-span-2',
        )}
        to="/workouts"
      >
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="flex min-w-0 flex-1 gap-4">
            <div
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25',
              )}
            >
              <IconTrain className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-violet-700/90 dark:text-violet-300/90">
                Train
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-[var(--lift-text)]">
                Workouts and volume
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--lift-text-muted)]">
                Log sessions, exercises, and sets. Tap to open your training log.
              </p>
            </div>
          </div>
          <Chevron />
        </div>
        <div className="grid grid-cols-3 gap-px border-t border-violet-200/60 bg-violet-200/60 dark:border-violet-500/20 dark:bg-violet-500/15">
          {[
            { label: 'Workouts', value: totals.totalWorkouts },
            { label: 'Sets', value: totals.totalSets },
            { label: 'Volume (lb)', value: totals.totalVolumeLb.toLocaleString() },
          ].map((cell) => (
            <div
              key={cell.label}
              className="bg-white/90 px-3 py-4 text-center dark:bg-[var(--lift-surface)]/95"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--lift-text-muted)]">
                {cell.label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums tracking-tight text-[var(--lift-text)]">
                {cell.value}
              </p>
            </div>
          ))}
        </div>
      </Link>

      <Link
        className={cn(
          'group lift-card max-w-none !p-0 no-underline transition active:scale-[0.99]',
          'border-rose-200/70 bg-gradient-to-br from-rose-50/95 via-white to-violet-50/50',
          'dark:border-rose-500/20 dark:from-rose-950/40 dark:via-[var(--lift-surface)] dark:to-violet-950/25',
        )}
        to="/bodyweight"
      >
        <div className="flex items-start justify-between gap-3 border-b border-rose-200/50 p-5 dark:border-rose-500/15">
          <div className="flex min-w-0 flex-1 gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                'bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-md shadow-rose-500/25',
              )}
            >
              <IconScale className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700/85 dark:text-rose-300/90">
                Bodyweight
              </p>
              <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[var(--lift-text)]">
                Weigh-ins
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--lift-text-muted)]">
                Calendar heatmap and daily entries
              </p>
            </div>
          </div>
          <Chevron />
        </div>
        <div className="space-y-3 p-5 pt-4">
          <p className="text-sm text-[var(--lift-text-muted)]">
            <span className="font-semibold text-[var(--lift-text)]">7-day average: </span>
            {weightTrend.latest7DayAvg !== null && weightTrend.latest7DayAvg !== undefined
              ? `${weightTrend.latest7DayAvg} lb`
              : 'No data yet'}
          </p>
          {weightTrend.points.length ? (
            <ul className="space-y-1.5">
              {weightTrend.points.slice(-5).map((point) => (
                <li key={point.date} className="lift-trend-row text-[11px]">
                  <span className="text-[var(--lift-text-muted)]">{formatDate(point.date)}</span>
                  <span className="font-semibold tabular-nums text-[var(--lift-text)]">
                    {point.avgWeightLb} lb
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--lift-text-muted)]">
              Start logging on the Bodyweight page to see your rolling average here.
            </p>
          )}
        </div>
      </Link>

      <Link
        className={cn(
          'group lift-card max-w-none !p-0 no-underline transition active:scale-[0.99]',
          'border-emerald-200/80 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/60',
          'dark:border-emerald-500/20 dark:from-emerald-950/40 dark:via-[var(--lift-surface)] dark:to-teal-950/25',
        )}
        to="/steps"
      >
        <div className="flex items-start justify-between gap-3 border-b border-emerald-200/50 p-5 dark:border-emerald-500/15">
          <div className="flex min-w-0 flex-1 gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
              )}
            >
              <IconSteps className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/85 dark:text-emerald-300/90">
                Steps
              </p>
              <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[var(--lift-text)]">
                Daily movement
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--lift-text-muted)]">
                Same calendar style as weigh-ins
              </p>
            </div>
          </div>
          <Chevron />
        </div>
        <div className="space-y-3 p-5 pt-4">
          <p className="text-sm text-[var(--lift-text-muted)]">
            <span className="font-semibold text-[var(--lift-text)]">7-day average: </span>
            {stepsTrend.latest7DayAvg !== null && stepsTrend.latest7DayAvg !== undefined
              ? `${stepsTrend.latest7DayAvg.toLocaleString()} steps`
              : 'No data yet'}
          </p>
          {stepsTrend.points.length ? (
            <ul className="space-y-1.5">
              {stepsTrend.points.slice(-5).map((point) => (
                <li key={point.date} className="lift-trend-row text-[11px]">
                  <span className="text-[var(--lift-text-muted)]">{formatDate(point.date)}</span>
                  <span className="font-semibold tabular-nums text-[var(--lift-text)]">
                    {point.avgSteps.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--lift-text-muted)]">
              Log steps on the Steps page to fill this trend and your dashboard.
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}
