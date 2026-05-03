import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  addExerciseToWorkout,
  addSetToWorkoutExercise,
  createWorkout,
  deleteWorkout,
  listWorkouts,
} from '../lib/api'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { LoadingState } from '../components/ui/LoadingState'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../features/auth/useAuth'
import type { WorkoutSessionItem } from '../types/domain'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function toLocalInputDateTime(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function WorkoutsPage() {
  const { session } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutSessionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingExerciseForWorkout, setIsSavingExerciseForWorkout] = useState<
    string | null
  >(null)
  const [isSavingSetForExercise, setIsSavingSetForExercise] = useState<
    string | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null)
  const [form, setForm] = useState({
    startedAt: toLocalInputDateTime(new Date()),
    name: '',
    notes: '',
  })
  const [exerciseNameByWorkoutId, setExerciseNameByWorkoutId] = useState<
    Record<string, string>
  >({})
  const [setFormByExerciseId, setSetFormByExerciseId] = useState<
    Record<string, { reps: string; weightKg: string }>
  >({})

  const refreshWorkouts = useCallback(async () => {
    if (!session) {
      return
    }
    const result = await listWorkouts(session.access_token)
    setWorkouts(result.workouts)
  }, [session])

  useEffect(() => {
    if (!session) {
      return
    }

    const token = session.access_token

    async function loadWorkouts() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await listWorkouts(token)
        setWorkouts(result.workouts)
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load workouts',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadWorkouts()
  }, [session])

  const totalWorkouts = useMemo(() => workouts.length, [workouts])

  async function onCreateWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) {
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const result = await createWorkout({
        accessToken: session.access_token,
        startedAt: new Date(form.startedAt).toISOString(),
        name: form.name,
        notes: form.notes,
      })

      setWorkouts((current) => [result.workout, ...current])
      setForm({
        startedAt: toLocalInputDateTime(new Date()),
        name: '',
        notes: '',
      })
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to create workout',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function onAddExercise(event: FormEvent<HTMLFormElement>, workoutId: string) {
    event.preventDefault()
    if (!session) {
      return
    }

    const name = exerciseNameByWorkoutId[workoutId]?.trim()
    if (!name) {
      setError('Exercise name is required')
      return
    }

    try {
      setIsSavingExerciseForWorkout(workoutId)
      setError(null)
      await addExerciseToWorkout({
        accessToken: session.access_token,
        workoutId,
        name,
      })

      await refreshWorkouts()

      setExerciseNameByWorkoutId((current) => ({
        ...current,
        [workoutId]: '',
      }))
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to add exercise',
      )
    } finally {
      setIsSavingExerciseForWorkout(null)
    }
  }

  async function onAddSet(
    event: FormEvent<HTMLFormElement>,
    workoutId: string,
    workoutExerciseId: string,
  ) {
    event.preventDefault()
    if (!session) {
      return
    }

    const setForm = setFormByExerciseId[workoutExerciseId] ?? {
      reps: '',
      weightKg: '',
    }

    const reps = Number(setForm.reps)
    const weightLb = Number(setForm.weightKg)

    if (!Number.isFinite(reps) || reps <= 0) {
      setError('Reps must be a positive number')
      return
    }

    if (!Number.isFinite(weightLb) || weightLb < 0) {
      setError('Weight must be zero or higher')
      return
    }

    try {
      setIsSavingSetForExercise(workoutExerciseId)
      setError(null)
      const result = await addSetToWorkoutExercise({
        accessToken: session.access_token,
        workoutExerciseId,
        reps,
        weightLb,
      })

      setWorkouts((current) =>
        current.map((workout) =>
          workout.id === workoutId
            ? {
                ...workout,
                workoutExercises: workout.workoutExercises.map((workoutExercise) =>
                  workoutExercise.id === workoutExerciseId
                    ? {
                        ...workoutExercise,
                        sets: [...workoutExercise.sets, result.setEntry],
                      }
                    : workoutExercise,
                ),
              }
            : workout,
        ),
      )

      setSetFormByExerciseId((current) => ({
        ...current,
        [workoutExerciseId]: { reps: '', weightKg: '' },
      }))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to add set')
    } finally {
      setIsSavingSetForExercise(null)
    }
  }

  async function onDeleteWorkout(workoutId: string) {
    if (!session) {
      return
    }

    const ok = window.confirm(
      'Delete this workout and all of its exercises and sets? This cannot be undone.',
    )
    if (!ok) {
      return
    }

    try {
      setDeletingWorkoutId(workoutId)
      setError(null)
      await deleteWorkout(session.access_token, workoutId)
      setWorkouts((current) => current.filter((w) => w.id !== workoutId))
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Failed to delete workout',
      )
    } finally {
      setDeletingWorkoutId(null)
    }
  }

  return (
    <section className="lift-page">
      <PageHeader
        title="Workouts"
        description="Start a session, add exercises, then log sets in pounds. Everything here feeds your dashboard totals."
        eyebrow={`${totalWorkouts} session${totalWorkouts === 1 ? '' : 's'} logged`}
      />

      <form className="lift-card" onSubmit={onCreateWorkout}>
        <h2 className="text-sm font-semibold tracking-tight text-[var(--lift-text)]">
          New session
        </h2>

        <label className="block">
          <span className="lift-label">Date and time</span>
          <input
            className="lift-input"
            type="datetime-local"
            value={form.startedAt}
            onChange={(event) =>
              setForm((current) => ({ ...current, startedAt: event.target.value }))
            }
            required
          />
        </label>

        <label className="block">
          <span className="lift-label">Name (optional)</span>
          <input
            className="lift-input"
            placeholder="Push day"
            type="text"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="lift-label">Notes (optional)</span>
          <textarea
            className="lift-textarea"
            placeholder="Energy felt great today…"
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </label>

        <button className="lift-btn-primary w-full sm:w-fit" disabled={isSaving} type="submit">
          {isSaving ? 'Saving…' : 'Create workout session'}
        </button>
      </form>

      {error ? <ErrorAlert message={error} /> : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--lift-text)]">
          Recent sessions
        </h2>

        {isLoading ? (
          <LoadingState label="Loading your sessions…" />
        ) : workouts.length === 0 ? (
          <EmptyState>
            No sessions yet. Create one above, then add exercises and sets. Your
            volume totals update on the dashboard automatically.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => (
              <li key={workout.id} className="lift-list-row space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--lift-text)]">
                      {workout.name?.trim() || 'Untitled workout'}
                    </p>
                    <p className="mt-1 text-xs text-[var(--lift-text-muted)]">
                      {formatDateTime(workout.startedAt)}
                    </p>
                    {workout.notes ? (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--lift-text-muted)]">
                        {workout.notes}
                      </p>
                    ) : null}
                  </div>
                  <button
                    className="lift-btn-ghost shrink-0 self-end sm:self-start"
                    disabled={deletingWorkoutId === workout.id}
                    type="button"
                    onClick={() => void onDeleteWorkout(workout.id)}
                  >
                    {deletingWorkoutId === workout.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>

                <div className="lift-card-nested space-y-3">
                  <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={(event) => onAddExercise(event, workout.id)}
                  >
                    <label className="min-w-[12rem] flex-1">
                      <span className="lift-label">Add exercise</span>
                      <input
                        className="lift-input"
                        placeholder="Bench press"
                        type="text"
                        value={exerciseNameByWorkoutId[workout.id] ?? ''}
                        onChange={(event) =>
                          setExerciseNameByWorkoutId((current) => ({
                            ...current,
                            [workout.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <button
                      className="lift-btn-secondary shrink-0"
                      disabled={isSavingExerciseForWorkout === workout.id}
                      type="submit"
                    >
                      {isSavingExerciseForWorkout === workout.id
                        ? 'Adding…'
                        : 'Add exercise'}
                    </button>
                  </form>

                  {workout.workoutExercises.length === 0 ? (
                    <p className="text-xs text-[var(--lift-text-muted)]">
                      No exercises yet — add the first movement for this session.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {workout.workoutExercises.map((workoutExercise) => (
                        <li
                          key={workoutExercise.id}
                          className="rounded-xl border border-[var(--lift-border)] bg-[var(--lift-surface-2)] p-3"
                        >
                          <p className="text-sm font-semibold text-[var(--lift-text)]">
                            {workoutExercise.sortOrder}. {workoutExercise.exercise.name}
                          </p>

                          {workoutExercise.sets.length === 0 ? (
                            <p className="mt-1 text-xs text-[var(--lift-text-muted)]">
                              No sets logged yet.
                            </p>
                          ) : (
                            <ul className="mt-2 space-y-1">
                              {workoutExercise.sets.map((setEntry) => (
                                <li
                                  key={setEntry.id}
                                  className="text-xs tabular-nums text-[var(--lift-text-muted)]"
                                >
                                  Set {setEntry.setNumber}: {setEntry.reps} reps ×{' '}
                                  {setEntry.weightLb} lb
                                </li>
                              ))}
                            </ul>
                          )}

                          <form
                            className="mt-3 flex flex-wrap items-end gap-2"
                            onSubmit={(event) =>
                              onAddSet(event, workout.id, workoutExercise.id)
                            }
                          >
                            <label>
                              <span className="lift-label text-[11px]">Reps</span>
                              <input
                                className="lift-input-sm w-[5.5rem]"
                                min="1"
                                type="number"
                                value={
                                  setFormByExerciseId[workoutExercise.id]?.reps ?? ''
                                }
                                onChange={(event) =>
                                  setSetFormByExerciseId((current) => ({
                                    ...current,
                                    [workoutExercise.id]: {
                                      reps: event.target.value,
                                      weightKg:
                                        current[workoutExercise.id]?.weightKg ?? '',
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span className="lift-label text-[11px]">Weight (lb)</span>
                              <input
                                className="lift-input-sm w-[6.5rem]"
                                min="0"
                                step="0.01"
                                type="number"
                                value={
                                  setFormByExerciseId[workoutExercise.id]?.weightKg ??
                                  ''
                                }
                                onChange={(event) =>
                                  setSetFormByExerciseId((current) => ({
                                    ...current,
                                    [workoutExercise.id]: {
                                      reps: current[workoutExercise.id]?.reps ?? '',
                                      weightKg: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>

                            <button
                              className="lift-btn-secondary shrink-0"
                              disabled={isSavingSetForExercise === workoutExercise.id}
                              type="submit"
                            >
                              {isSavingSetForExercise === workoutExercise.id
                                ? 'Saving…'
                                : 'Add set'}
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
