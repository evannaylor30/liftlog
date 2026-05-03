import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { BodyweightCalendar } from '../features/bodyweight/BodyweightCalendar'
import {
  deleteBodyweightLog,
  listBodyweightLogs,
  upsertBodyweightLog,
} from '../lib/api'
import { shiftMonthYm } from '../lib/monthYm'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../features/auth/useAuth'
import type { BodyweightLogItem } from '../types/domain'

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

export function BodyweightPage() {
  const { session } = useAuth()
  const [logs, setLogs] = useState<BodyweightLogItem[]>([])
  const [date, setDate] = useState(todayYmdLocal)
  const [viewMonthYm, setViewMonthYm] = useState(() => todayYmdLocal().slice(0, 7))
  /** When non-null, weight field shows this string instead of the saved log for `date`. */
  const [weightOverride, setWeightOverride] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loggedDates = useMemo(() => {
    return new Set(logs.map((log) => log.date.slice(0, 10)))
  }, [logs])

  const savedWeightForSelectedDay = useMemo(() => {
    const log = logs.find((l) => l.date.startsWith(date))
    return log?.weightLb ?? null
  }, [date, logs])

  const weightLb =
    weightOverride !== null
      ? weightOverride
      : savedWeightForSelectedDay != null
        ? String(savedWeightForSelectedDay)
        : ''

  function setSelectedDate(next: string) {
    setDate(next)
    setViewMonthYm(next.slice(0, 7))
    setWeightOverride(null)
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
        const result = await listBodyweightLogs(currentSession.access_token, {
          take: 180,
        })
        setLogs(result.logs)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Failed to load bodyweight logs',
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

    const parsedWeightLb = Number(weightLb)
    if (!Number.isFinite(parsedWeightLb) || parsedWeightLb <= 0) {
      setError('Weight must be a positive number')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const result = await upsertBodyweightLog({
        accessToken: session.access_token,
        date,
        weightLb: parsedWeightLb,
      })

      setLogs((current) => {
        const withoutSameDay = current.filter((log) => !log.date.startsWith(date))
        return [result.log, ...withoutSameDay].sort((a, b) =>
          a.date > b.date ? -1 : 1,
        )
      })
      setWeightOverride(null)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Failed to save bodyweight log',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function onDeleteWeighIn(logId: string, entryDate: string) {
    if (!session) {
      return
    }

    const confirmed = window.confirm(
      `Remove the weigh-in for ${formatDate(entryDate)}? You can log again anytime.`,
    )
    if (!confirmed) {
      return
    }

    try {
      setDeletingLogId(logId)
      setError(null)
      await deleteBodyweightLog(session.access_token, logId)
      setLogs((current) => current.filter((log) => log.id !== logId))
      if (date.startsWith(entryDate.slice(0, 10))) {
        setWeightOverride(null)
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete weigh-in',
      )
    } finally {
      setDeletingLogId(null)
    }
  }

  return (
    <section className="lift-page">
      <PageHeader
        title="Bodyweight"
        description="Tap the calendar to pick a day, then log your weight. Saving again overwrites that day."
      />

      <BodyweightCalendar
        footerHint="Filled squares are weigh-in days. Tap a day to log or edit that date."
        heatmapVariant="violet"
        loggedDates={loggedDates}
        selectedYmd={date}
        viewMonthYm={viewMonthYm}
        onMonthChange={(delta) => setViewMonthYm((ym) => shiftMonthYm(ym, delta))}
        onSelectDay={(ymd) => setSelectedDate(ymd)}
      />

      <form className="lift-card" onSubmit={onSubmit}>
        <h2 className="text-sm font-semibold tracking-tight text-[var(--lift-text)]">
          Log weight
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
            <span className="lift-label">Weight (lb)</span>
            <input
              className="lift-input min-h-12 text-lg font-semibold tabular-nums"
              inputMode="decimal"
              min="1"
              step="0.1"
              type="number"
              value={weightLb}
              onChange={(event) => setWeightOverride(event.target.value)}
              required
            />
          </label>
        </div>

        <button className="lift-btn-primary w-full sm:w-fit" disabled={isSaving} type="submit">
          {isSaving ? 'Saving…' : 'Save weigh-in'}
        </button>
      </form>

      {error ? <ErrorAlert message={error} /> : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--lift-text)]">
          Recent entries
        </h2>
        {isLoading ? (
          <LoadingState label="Loading bodyweight history…" />
        ) : logs.length === 0 ? (
          <EmptyState>
            No entries yet. Pick today on the calendar and add your first weigh-in.
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
                    {log.weightLb} lb
                  </p>
                </div>
                <button
                  className="lift-btn-secondary shrink-0 self-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  disabled={deletingLogId === log.id}
                  type="button"
                  onClick={() => void onDeleteWeighIn(log.id, log.date)}
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
