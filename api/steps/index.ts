import { AuthError, requireAuthUser } from '../_lib/auth'
import { prisma } from '../_lib/prisma'

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

type CreateStepsPayload = {
  date?: string
  steps?: number
}

function parseCreatePayload(body: unknown): CreateStepsPayload {
  if (!body || typeof body !== 'object') {
    return {}
  }

  return body as CreateStepsPayload
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

export default async function handler(req: RequestLike, res: JsonResponse) {
  try {
    const user = await requireAuthUser(req)

    if (req.method === 'GET') {
      const take = parseTake(req.query)
      const logs = await prisma.stepsLog.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take,
        select: {
          id: true,
          date: true,
          steps: true,
        },
      })

      res.status(200).json({ logs })
      return
    }

    if (req.method === 'POST') {
      const payload = parseCreatePayload(req.body)
      const date = toDateOnly(payload.date)
      const steps = Number(payload.steps)

      if (!date) {
        res.status(400).json({ error: 'Invalid date value' })
        return
      }

      if (!Number.isFinite(steps) || steps < 0) {
        res.status(400).json({ error: 'Steps must be zero or higher' })
        return
      }

      const log = await prisma.stepsLog.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
        create: {
          userId: user.id,
          date,
          steps: Math.round(steps),
        },
        update: {
          steps: Math.round(steps),
        },
        select: {
          id: true,
          date: true,
          steps: true,
        },
      })

      res.status(201).json({ log })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    const detail = error instanceof Error ? error.message : String(error)
    console.error('[api/steps]', error)
    res.status(500).json({
      error: 'Failed to handle steps request',
      detail,
    })
  }
}
