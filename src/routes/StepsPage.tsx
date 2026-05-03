import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { BodyweightCalendar } from '../features/bodyweight/BodyweightCalendar'
import { deleteStepsLog, listStepsLogs, upsertStepsLog } from '../lib/api'
import { shiftMonthYm } from '../lib/monthYm'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../features/auth/useAuth'
import type { StepsLogItem } from '../types/domain'

function todayYmdLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

export function StepsPage() {
  const { session } = useAuth()
  const [logs, setLogs] = useState<StepsLogItem[]>([])
  const [date, setDate] = useState(todayYmdLocal)
  const [viewMonthYm, setViewMonthYm] = useState(() => todayYmdLocal().slice(0, 7))
  const [stepsOverride, setStepsOverride] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loggedDates = useMemo(() => {
    return new Set(logs.map((log) => log.date.slice(0, 10)))
  }, [logs])

  const savedStepsForSelectedDay = useMemo(() => {
    const log = logs.find((l) => l.date.startsWith(date))
    return log?.steps ?? null
  }, [date, logs])

  const steps =
    stepsOverride !== null
      ? stepsOverride
      : savedStepsForSelectedDay != null
        ? String(savedStepsForSelectedDay)
        : ''

  function setSelectedDate(next: string) {
    setDate(next)
    setViewMonthYm(next.slice(0, 7))
    setStepsOverride(null)
  }

  useEffect(() => {
    if (!session) {
      return
    }
    const currentSession = session

    async function loadLogs() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await listStepsLogs(currentSession.access_token, { take: 180 })
        setLogs(result.logs)
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load steps logs',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadLogs()
  }, [session])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) {
      return
    }

    const parsedSteps = Number(steps)
    if (!Number.isFinite(parsedSteps) || parsedSteps < 0) {
      setError('Steps must be zero or higher')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const result = await upsertStepsLog({
        accessToken: session.access_token,
        date,
        steps: parsedSteps,
      })

      setLogs((current) => {
        const withoutSameDay = current.filter((log) => !log.date.startsWith(date))
        return [result.log, ...withoutSameDay].sort((a, b) =>
          a.date > b.date ? -1 : 1,
        )
      })
      setStepsOverride(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save steps log')
    } finally {
      setIsSaving(false)
    }
  }

  async function onDeleteStepsEntry(logId: string, entryDate: string) {
    if (!session) {
      return
    }

    const confirmed = window.confirm(
      `Remove the step count for ${formatDate(entryDate)}? You can add it again later.`,
    )
    if (!confirmed) {
      return
    }

    try {
      setDeletingLogId(logId)
      setError(null)
      await deleteStepsLog(session.access_token, logId)
      setLogs((current) => current.filter((log) => log.id !== logId))
      if (date.startsWith(entryDate.slice(0, 10))) {
        setStepsOverride(null)
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete steps entry',
      )
    } finally {
      setDeletingLogId(null)
    }
  }

  return (
    <section className="lift-page">
      <PageHeader
        title="Steps"
        description="Same idea as weigh-ins: tap the month grid, then log steps for that day."
      />

      <BodyweightCalendar
        footerHint="Filled squares are days with a step count saved. Tap a day to edit that date."
        heatmapVariant="emerald"
        loggedDates={loggedDates}
        selectedYmd={date}
        viewMonthYm={viewMonthYm}
        onMonthChange={(delta) => setViewMonthYm((ym) => shiftMonthYm(ym, delta))}
        onSelectDay={(ymd) => setSelectedDate(ymd)}
      />

      <form className="lift-card" onSubmit={onSubmit}>
        <h2 className="text-sm font-semibold tracking-tight text-[var(--lift-text)]">
          Log steps
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <label className="block min-w-0 sm:min-w-[10rem]">
            <span className="lift-label">Date</span>
            <input
              className="lift-input min-h-12"
              type="date"
              value={date}
              onChange={(event) => setSelectedDate(event.target.value)}
              required
            />
          </label>
          <label className="block min-w-0 flex-1 sm:min-w-[8rem]">
            <span className="lift-label">Steps</span>
            <input
              className="lift-input min-h-12 text-lg font-semibold tabular-nums"
              inputMode="numeric"
              min="0"
              step="1"
              type="number"
              value={steps}
              onChange={(event) => setStepsOverride(event.target.value)}
              required
            />
          </label>
        </div>
        <button className="lift-btn-primary w-full sm:w-fit" disabled={isSaving} type="submit">
          {isSaving ? 'Saving…' : 'Save steps'}
        </button>
      </form>

      {error ? <ErrorAlert message={error} /> : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--lift-text)]">
          Recent entries
        </h2>
        {isLoading ? (
          <LoadingState label="Loading step history…" />
        ) : logs.length === 0 ? (
          <EmptyState>
            No step entries yet. Pick a day on the calendar and add your first count.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li
                key={log.id}
                className="lift-list-row flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--lift-text)]">{formatDate(log.date)}</p>
                  <p className="mt-1 text-sm tabular-nums text-[var(--lift-text-muted)]">
                    {log.steps.toLocaleString()} steps
                  </p>
                </div>
                <button
                  className="lift-btn-secondary shrink-0 self-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  disabled={deletingLogId === log.id}
                  type="button"
                  onClick={() => void onDeleteStepsEntry(log.id, log.date)}
                >
                  {deletingLogId === log.id ? 'Deleting…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
