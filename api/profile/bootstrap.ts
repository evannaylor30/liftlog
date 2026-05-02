import type { WeightUnit } from '@prisma/client'
import { AuthError, requireAuthUser } from '../_lib/auth'
import { prisma } from '../_lib/prisma'

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
}

export default async function handler(req: RequestLike, res: JsonResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const user = await requireAuthUser(req)

    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        displayName: user.user_metadata?.display_name ?? null,
        weightUnit: 'kg' as WeightUnit,
      },
      update: {
        displayName: user.user_metadata?.display_name ?? null,
      },
      select: {
        id: true,
        displayName: true,
        weightUnit: true,
      },
    })

    res.status(200).json({ profile })
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message })
      return
    }

    res.status(500).json({ error: 'Failed to bootstrap profile' })
  }
}
