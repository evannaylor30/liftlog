import { getServerEnv } from './_lib/env.js'

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
}

/**
 * Public Supabase URL + anon key for the SPA bootstrap (anon is already public).
 * No auth — avoids relying on Vite inlining env into the JS bundle on Vercel.
 */
export default async function handler(req: RequestLike, res: JsonResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const env = getServerEnv()
    res.status(200).json({
      supabaseUrl: env.supabaseUrl,
      supabaseAnonKey: env.supabaseAnonKey,
    })
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Server is missing SUPABASE_URL / SUPABASE_ANON_KEY (or VITE_* equivalents)',
    })
  }
}
