import { AuthError, requireAuthUser } from '../_lib/auth.js'
import { prisma } from '../_lib/prisma.js'

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  query?: Record<string, string | string[] | undefined>
}

function readId(query: RequestLike['query']) {
  const value = query?.id
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: RequestLike, res: JsonResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const user = await requireAuthUser(req)
    const id = readId(req.query)

    if (!id) {
      res.status(400).json({ error: 'Missing bodyweight log id' })
      return
    }

    const result = await prisma.bodyweightLog.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    if (result.count === 0) {
      res.status(404).json({ error: 'Weigh-in not found' })
      return
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    const detail = error instanceof Error ? error.message : String(error)
    console.error('[api/bodyweight/[id]]', error)
    res.status(500).json({
      error: 'Failed to delete weigh-in',
      detail,
    })
  }
}
