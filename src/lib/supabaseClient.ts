import { createClient } from '@supabase/supabase-js'
import type { Env } from '../types/env'

const env: Env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase env vars. Locally: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env. On Vercel: set the same keys under Project → Settings → Environment Variables (Production), then redeploy.',
  )
}

export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
)
