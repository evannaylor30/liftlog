import type {
  BodyweightLogItem,
  DashboardMetrics,
  SetEntryItem,
  StepsLogItem,
  WorkoutExerciseItem,
  WorkoutSessionItem,
} from '../types/domain'

type ApiErrorPayload = { error?: string; detail?: string }

async function throwApiError(response: Response, fallback: string): Promise<never> {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null
  const base = payload?.error ?? fallback
  const detail = payload?.detail
  const message = detail ? `${base}: ${detail}` : base
  // Browser’s “Failed to load resource: 500” line has no body; log the server message here.
  console.error('[Liftlog API]', response.status, response.url, message)
  throw new Error(message)
}

export async function bootstrapProfile(accessToken: string) {
  const response = await fetch('/api/profile/bootstrap', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Profile bootstrap failed')
  }

  return (await response.json()) as {
    profile: {
      id: string
      displayName: string | null
      weightUnit: 'kg' | 'lb'
    }
  }
}

export async function listWorkouts(accessToken: string) {
  const response = await fetch('/api/workouts', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to load workouts')
  }

  return (await response.json()) as {
    workouts: WorkoutSessionItem[]
  }
}

type CreateWorkoutInput = {
  accessToken: string
  startedAt: string
  name?: string
  notes?: string
}

export async function createWorkout(input: CreateWorkoutInput) {
  const response = await fetch('/api/workouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      startedAt: input.startedAt,
      name: input.name,
      notes: input.notes,
    }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to create workout')
  }

  return (await response.json()) as {
    workout: WorkoutSessionItem
  }
}

export async function deleteWorkout(accessToken: string, workoutId: string) {
  const response = await fetch(`/api/session/${workoutId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to delete workout')
  }
}

type AddExerciseInput = {
  accessToken: string
  workoutId: string
  name: string
}

export async function addExerciseToWorkout(input: AddExerciseInput) {
  const response = await fetch('/api/create-workout-exercise', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      workoutId: input.workoutId,
      name: input.name,
    }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to add exercise')
  }

  return (await response.json()) as {
    workoutExercise: WorkoutExerciseItem
  }
}

type AddSetInput = {
  accessToken: string
  workoutExerciseId: string
  reps: number
  weightLb: number
}

export async function addSetToWorkoutExercise(input: AddSetInput) {
  const response = await fetch(
    `/api/workout-exercises/${input.workoutExerciseId}/sets`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify({
        reps: input.reps,
        weightLb: input.weightLb,
      }),
    },
  )

  if (!response.ok) {
    await throwApiError(response, 'Failed to add set')
  }

  return (await response.json()) as {
    setEntry: SetEntryItem
  }
}

export async function listBodyweightLogs(
  accessToken: string,
  options?: { take?: number },
) {
  const params = new URLSearchParams()
  if (options?.take != null) {
    params.set('take', String(options.take))
  }
  const qs = params.toString()
  const url = qs ? `/api/bodyweight?${qs}` : '/api/bodyweight'
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to load bodyweight logs')
  }

  return (await response.json()) as {
    logs: BodyweightLogItem[]
  }
}

type UpsertBodyweightInput = {
  accessToken: string
  date: string
  weightLb: number
}

export async function upsertBodyweightLog(input: UpsertBodyweightInput) {
  const response = await fetch('/api/bodyweight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      date: input.date,
      weightLb: input.weightLb,
    }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to save bodyweight log')
  }

  return (await response.json()) as {
    log: BodyweightLogItem
  }
}

export async function listStepsLogs(
  accessToken: string,
  options?: { take?: number },
) {
  const params = new URLSearchParams()
  if (options?.take != null) {
    params.set('take', String(options.take))
  }
  const qs = params.toString()
  const url = qs ? `/api/steps?${qs}` : '/api/steps'
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to load steps logs')
  }

  return (await response.json()) as {
    logs: StepsLogItem[]
  }
}

type UpsertStepsInput = {
  accessToken: string
  date: string
  steps: number
}

export async function upsertStepsLog(input: UpsertStepsInput) {
  const response = await fetch('/api/steps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      date: input.date,
      steps: input.steps,
    }),
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to save steps log')
  }

  return (await response.json()) as {
    log: StepsLogItem
  }
}

export async function deleteStepsLog(accessToken: string, logId: string) {
  const response = await fetch(`/api/steps/${encodeURIComponent(logId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to delete steps entry')
  }
}

export async function getDashboardMetrics(accessToken: string) {
  const response = await fetch('/api/dashboard', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwApiError(response, 'Failed to load dashboard metrics')
  }

  return (await response.json()) as DashboardMetrics
}
