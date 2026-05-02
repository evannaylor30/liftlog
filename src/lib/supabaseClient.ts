import { createClient } from '@supabase/supabase-js'

type LiftlogPublicEnv = {
  url?: string
  anonKey?: string
}

function readLiftlogEnvFromDom(): LiftlogPublicEnv {
  if (typeof document === 'undefined') {
    return {}
  }
  const el = document.getElementById('liftlog-env')
  if (!el?.textContent?.trim()) {
    return {}
  }
  try {
    return JSON.parse(el.textContent) as LiftlogPublicEnv
  } catch {
    return {}
  }
}

const fromDom = readLiftlogEnvFromDom()
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || fromDom.url || ''
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  fromDom.anonKey ||
  ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Locally: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) to .env. On Vercel: set the same under Project → Settings → Environment Variables (Production), then redeploy.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
