import { AuthError, requireAuthUser } from '../_lib/auth'
import { prisma } from '../_lib/prisma'

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

type CreateBodyweightPayload = {
  date?: string
  weightLb?: number
}

function parseCreatePayload(body: unknown): CreateBodyweightPayload {
  if (!body || typeof body !== 'object') {
    return {}
  }

  return body as CreateBodyweightPayload
}

function toDateOnly(input?: string) {
  if (!input) {
    const now = new Date()
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  }

  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()),
  )
}

function parseTake(query: RequestLike['query']) {
  const raw = query?.take
  const value = Array.isArray(raw) ? raw[0] : raw
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) {
    return 30
  }
  return Math.min(400, Math.floor(n))
}

export default async function handler(req: RequestLike, res: JsonResponse) {
  try {
    const user = await requireAuthUser(req)

    if (req.method === 'GET') {
      const take = parseTake(req.query)
      const logs = await prisma.bodyweightLog.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take,
        select: {
          id: true,
          date: true,
          weightKg: true,
        },
      })

      res.status(200).json({
        logs: logs.map((log) => ({
          id: log.id,
          date: log.date,
          weightLb: Number((log.weightKg.toNumber() * KG_TO_LB).toFixed(2)),
        })),
      })
      return
    }

    if (req.method === 'POST') {
      const payload = parseCreatePayload(req.body)
      const date = toDateOnly(payload.date)
      const weightLb = Number(payload.weightLb)

      if (!date) {
        res.status(400).json({ error: 'Invalid date value' })
        return
      }

      if (!Number.isFinite(weightLb) || weightLb <= 0) {
        res.status(400).json({ error: 'Weight must be a positive number' })
        return
      }

      const weightKg = Number((weightLb * LB_TO_KG).toFixed(2))

      const log = await prisma.bodyweightLog.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
        create: {
          userId: user.id,
          date,
          weightKg,
        },
        update: {
          weightKg,
        },
        select: {
          id: true,
          date: true,
          weightKg: true,
        },
      })

      res.status(201).json({
        log: {
          id: log.id,
          date: log.date,
          weightLb: Number((log.weightKg.toNumber() * KG_TO_LB).toFixed(2)),
        },
      })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    const detail = error instanceof Error ? error.message : String(error)
    console.error('[api/bodyweight]', error)
    res.status(500).json({
      error: 'Failed to handle bodyweight request',
      detail,
    })
  }
}
