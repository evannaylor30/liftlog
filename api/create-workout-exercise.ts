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

type Payload = {
  workoutId?: string
  name?: string
}

function parsePayload(body: unknown): Payload {
  if (!body || typeof body !== 'object') {
    return {}
  }

  return body as Payload
}

export default async function handler(req: RequestLike, res: JsonResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const user = await requireAuthUser(req)
    const payload = parsePayload(req.body)
    const workoutId = payload.workoutId?.trim()
    const name = payload.name?.trim()

    if (!workoutId) {
      res.status(400).json({ error: 'workoutId is required' })
      return
    }

    if (!name) {
      res.status(400).json({ error: 'Exercise name is required' })
      return
    }

    const workout = await prisma.workoutSession.findFirst({
      where: {
        id: workoutId,
        userId: user.id,
      },
      select: { id: true },
    })

    if (!workout) {
      res.status(404).json({ error: 'Workout not found' })
      return
    }

    const exercise = await prisma.exercise.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name,
        },
      },
      create: {
        userId: user.id,
        name,
      },
      update: {},
      select: {
        id: true,
        name: true,
      },
    })

    const lastEntry = await prisma.workoutExercise.findFirst({
      where: { workoutSessionId: workout.id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutSessionId: workout.id,
        exerciseId: exercise.id,
        sortOrder: (lastEntry?.sortOrder ?? 0) + 1,
      },
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
    })

    res.status(201).json({
      workoutExercise: {
        id: workoutExercise.id,
        sortOrder: workoutExercise.sortOrder,
        exercise: workoutExercise.exercise,
        sets: workoutExercise.sets.map((setEntry) => ({
          id: setEntry.id,
          setNumber: setEntry.setNumber,
          reps: setEntry.reps,
          weightLb: Number((setEntry.weightKg.toNumber() * KG_TO_LB).toFixed(2)),
        })),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    const detail = error instanceof Error ? error.message : String(error)
    console.error('[api/create-workout-exercise]', error)
    res.status(500).json({
      error: 'Failed to add exercise to workout',
      detail,
    })
  }
}
