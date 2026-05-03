import { AuthError, requireAuthUser } from './_lib/auth.js'
import { prisma } from './_lib/prisma.js'

const KG_TO_LB = 2.2046226218

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
}

type CreateWorkoutPayload = {
  startedAt?: string
  name?: string
  notes?: string
}

function parseCreatePayload(body: unknown): CreateWorkoutPayload {
  if (!body || typeof body !== 'object') {
    return {}
  }

  return body as CreateWorkoutPayload
}

function toValidDate(value?: string) {
  if (!value) {
    return new Date()
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function serializeWorkout(workout: {
  id: string
  startedAt: Date
  name: string | null
  notes: string | null
  workoutExercises: Array<{
    id: string
    sortOrder: number
    exercise: { id: string; name: string }
    sets: Array<{ id: string; setNumber: number; reps: number; weightKg: { toNumber: () => number } }>
  }>
}) {
  return {
    id: workout.id,
    startedAt: workout.startedAt,
    name: workout.name,
    notes: workout.notes,
    workoutExercises: workout.workoutExercises.map((workoutExercise) => ({
      id: workoutExercise.id,
      sortOrder: workoutExercise.sortOrder,
      exercise: workoutExercise.exercise,
      sets: workoutExercise.sets.map((setEntry) => ({
        id: setEntry.id,
        setNumber: setEntry.setNumber,
        reps: setEntry.reps,
        weightLb: Number((setEntry.weightKg.toNumber() * KG_TO_LB).toFixed(2)),
      })),
    })),
  }
}

export default async function handler(req: RequestLike, res: JsonResponse) {
  try {
    const user = await requireAuthUser(req)

    if (req.method === 'GET') {
      const workouts = await prisma.workoutSession.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          startedAt: true,
          name: true,
          notes: true,
          workoutExercises: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              sortOrder: true,
              exercise: {
                select: {
                  id: true,
                  name: true,
                },
              },
              sets: {
                orderBy: { setNumber: 'asc' },
                select: {
                  id: true,
                  setNumber: true,
                  reps: true,
                  weightKg: true,
                },
              },
            },
          },
        },
      })

      res.status(200).json({ workouts: workouts.map(serializeWorkout) })
      return
    }

    if (req.method === 'POST') {
      const payload = parseCreatePayload(req.body)
      const startedAt = toValidDate(payload.startedAt)

      if (!startedAt) {
        res.status(400).json({ error: 'Invalid startedAt date value' })
        return
      }

      const workout = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          startedAt,
          name: payload.name?.trim() || null,
          notes: payload.notes?.trim() || null,
        },
        select: {
          id: true,
          startedAt: true,
          name: true,
          notes: true,
          workoutExercises: {
            select: {
              id: true,
              sortOrder: true,
              exercise: {
                select: {
                  id: true,
                  name: true,
                },
              },
              sets: {
                select: {
                  id: true,
                  setNumber: true,
                  reps: true,
                  weightKg: true,
                },
              },
            },
          },
        },
      })

      res.status(201).json({ workout: serializeWorkout(workout) })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    const detail = error instanceof Error ? error.message : String(error)
    console.error('[api/workouts]', error)
    res.status(500).json({
      error: 'Failed to handle workouts request',
      detail,
    })
  }
}
