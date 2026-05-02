import { createClient } from '@supabase/supabase-js'
import { resolvePublicSupabaseConfig } from './publicSupabaseConfig'

const resolved = resolvePublicSupabaseConfig()

if (!resolved) {
  throw new Error(
    'Missing Supabase configuration. Open /api/public-config — if it errors, set SUPABASE_URL and SUPABASE_ANON_KEY on the server (Vercel → Environment Variables → Production). For local `npm run dev`, keep VITE_* or SUPABASE_* in .env so index.html can embed them.',
  )
}

export const supabase = createClient(
  resolved.supabaseUrl,
  resolved.supabaseAnonKey,
)
