import { Pool } from 'pg'
import { getTrimmedDatabaseUrl } from './_lib/databaseUrl.js'

type JsonResponse = {
  status: (code: number) => JsonResponse
  json: (payload: unknown) => void
}

type RequestLike = {
  method?: string
}

/**
 * No auth — use to verify Vercel has DATABASE_URL and Postgres is reachable.
 * Uses `pg` directly so Vercel does not need a separate bundled chunk for `./_lib/prisma`
 * (dynamic import of that path fails at runtime on `/var/task`).
 * Open GET /api/health in the browser on production.
 */
export default async function handler(req: RequestLike, res: JsonResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim())
  const hasSupabaseUrl = Boolean(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  )
  const hasSupabaseKey = Boolean(
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
  )

  if (!hasDatabaseUrl) {
    res.status(200).json({
      ok: false,
      database: 'missing_DATABASE_URL',
      hint: 'Add DATABASE_URL in Vercel → Settings → Environment Variables (Production), then redeploy.',
      hasDatabaseUrl: false,
      hasSupabaseUrl,
      hasSupabaseKey,
    })
    return
  }

  let connectionString: string
  try {
    connectionString = getTrimmedDatabaseUrl()
  } catch {
    res.status(200).json({
      ok: false,
      database: 'invalid_DATABASE_URL',
      message: 'DATABASE_URL is missing or invalid (check env value shape).',
      hint: 'No quotes around the full URI; use Supabase “Copy” URI; encode special characters in the password.',
      hasDatabaseUrl: false,
      hasSupabaseUrl,
      hasSupabaseKey,
    })
    return
  }

  try {
    const pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 12_000,
    })
    try {
      await pool.query('SELECT 1')
    } finally {
      await pool.end()
    }

    res.status(200).json({
      ok: true,
      database: 'connected',
      hasDatabaseUrl: true,
      hasSupabaseUrl,
      hasSupabaseKey,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    res.status(200).json({
      ok: false,
      database: 'query_failed',
      message,
      hint: 'Check pooler URL (port 6543 + ?pgbouncer=true), sslmode=require, and that prisma migrate deploy was run on this database.',
      hasDatabaseUrl: true,
      hasSupabaseUrl,
      hasSupabaseKey,
    })
  }
}
