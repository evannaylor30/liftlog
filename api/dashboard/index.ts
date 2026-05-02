import { AuthError, requireAuthUser } from '../_lib/auth'
import { prisma } from '../_lib/prisma'

const KG_TO_LB = 2.2046226218

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
}

type WeightPoint = {
  date: Date
  weightLb: number
}

type StepsPoint = {
  date: Date
  steps: number
}

function rolling7DayAverageWeight(points: WeightPoint[]) {
  const averages: Array<{ date: Date; avgWeightLb: number }> = []

  for (let index = 0; index < points.length; index += 1) {
    const slice = points.slice(Math.max(0, index - 6), index + 1)
    const total = slice.reduce((sum, point) => sum + point.weightLb, 0)
    averages.push({
      date: points[index].date,
      avgWeightLb: Number((total / slice.length).toFixed(2)),
    })
  }

  return averages
}

function rolling7DayAverageSteps(points: StepsPoint[]) {
  const averages: Array<{ date: Date; avgSteps: number }> = []

  for (let index = 0; index < points.length; index += 1) {
    const slice = points.slice(Math.max(0, index - 6), index + 1)
    const total = slice.reduce((sum, point) => sum + point.steps, 0)
    averages.push({
      date: points[index].date,
      avgSteps: Math.round(total / slice.length),
    })
  }

  return averages
}

export default async function handler(req: RequestLike, res: JsonResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const user = await requireAuthUser(req)

    const [totalWorkouts, totalSets, setEntries, bodyweightLogs, stepsLogs] =
      await Promise.all([
        prisma.workoutSession.count({
          where: { userId: user.id },
        }),
        prisma.setEntry.count({
          where: {
            workoutExercise: {
              workoutSession: {
                userId: user.id,
              },
            },
          },
        }),
        prisma.setEntry.findMany({
          where: {
            workoutExercise: {
              workoutSession: {
                userId: user.id,
              },
            },
          },
          select: {
            reps: true,
            weightKg: true,
          },
        }),
        prisma.bodyweightLog.findMany({
          where: { userId: user.id },
          orderBy: { date: 'asc' },
          take: 90,
          select: {
            date: true,
            weightKg: true,
          },
        }),
        prisma.stepsLog.findMany({
          where: { userId: user.id },
          orderBy: { date: 'asc' },
          take: 90,
          select: {
            date: true,
            steps: true,
          },
        }),
      ])

    const totalVolumeLb = Number(
      setEntries
        .reduce(
          (sum, entry) => sum + entry.reps * entry.weightKg.toNumber() * KG_TO_LB,
          0,
        )
        .toFixed(2),
    )

    const weightPoints = bodyweightLogs.map((log) => ({
      date: log.date,
      weightLb: Number((log.weightKg.toNumber() * KG_TO_LB).toFixed(2)),
    }))
    const weightTrend = rolling7DayAverageWeight(weightPoints).slice(-30)
    const latestWeight7DayAvg =
      weightTrend.length > 0 ? weightTrend[weightTrend.length - 1].avgWeightLb : null

    const stepsPoints = stepsLogs.map((log) => ({
      date: log.date,
      steps: log.steps,
    }))
    const stepsTrend = rolling7DayAverageSteps(stepsPoints).slice(-30)
    const latestSteps7DayAvg =
      stepsTrend.length > 0 ? stepsTrend[stepsTrend.length - 1].avgSteps : null

    res.status(200).json({
      totals: {
        totalWorkouts,
        totalSets,
        totalVolumeLb,
      },
      weightTrend: {
        latest7DayAvg: latestWeight7DayAvg,
        points: weightTrend,
      },
      stepsTrend: {
        latest7DayAvg: latestSteps7DayAvg,
        points: stepsTrend,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    res.status(500).json({ error: 'Failed to load dashboard data' })
  }
}
