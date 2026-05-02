import { AuthError, requireAuthUser } from '../../_lib/auth'
import { prisma } from '../../_lib/prisma'

const LB_TO_KG = 0.45359237
const KG_TO_LB = 2.2046226218

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}

type Payload = {
  reps?: number
  weightLb?: number
}

function readWorkoutExerciseId(query: RequestLike['query']) {
  const value = query?.workoutExerciseId
  return Array.isArray(value) ? value[0] : value
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
    const workoutExerciseId = readWorkoutExerciseId(req.query)
    const payload = parsePayload(req.body)
    const reps = Number(payload.reps)
    const weightLb = Number(payload.weightLb)

    if (!workoutExerciseId) {
      res.status(400).json({ error: 'Missing workoutExerciseId route param' })
      return
    }

    if (!Number.isFinite(reps) || reps <= 0) {
      res.status(400).json({ error: 'Reps must be a positive number' })
      return
    }

    if (!Number.isFinite(weightLb) || weightLb < 0) {
      res.status(400).json({ error: 'Weight must be a non-negative number' })
      return
    }

    const weightKg = Number((weightLb * LB_TO_KG).toFixed(2))

    const workoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        id: workoutExerciseId,
        workoutSession: {
          userId: user.id,
        },
      },
      select: { id: true },
    })

    if (!workoutExercise) {
      res.status(404).json({ error: 'Workout exercise not found' })
      return
    }

    const lastSet = await prisma.setEntry.findFirst({
      where: {
        workoutExerciseId: workoutExercise.id,
      },
      orderBy: { setNumber: 'desc' },
      select: { setNumber: true },
    })

    const setEntry = await prisma.setEntry.create({
      data: {
        workoutExerciseId: workoutExercise.id,
        setNumber: (lastSet?.setNumber ?? 0) + 1,
        reps: Math.round(reps),
        weightKg,
      },
      select: {
        id: true,
        setNumber: true,
        reps: true,
        weightKg: true,
      },
    })

    res.status(201).json({
      setEntry: {
        id: setEntry.id,
        setNumber: setEntry.setNumber,
        reps: setEntry.reps,
        weightLb: Number((setEntry.weightKg.toNumber() * KG_TO_LB).toFixed(2)),
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    res.status(500).json({ error: 'Failed to add set to workout exercise' })
  }
}
