export type PublicSupabaseConfig = {
  supabaseUrl: string
  supabaseAnonKey: string
}

declare global {
  interface Window {
    __LIFTLOG_PUBLIC_CONFIG__?: PublicSupabaseConfig
  }
}

function readLiftlogEnvFromDom(): Partial<PublicSupabaseConfig> {
  if (typeof document === 'undefined') {
    return {}
  }
  const el = document.getElementById('liftlog-env')
  if (!el?.textContent?.trim()) {
    return {}
  }
  try {
    const parsed = JSON.parse(el.textContent) as {
      url?: string
      anonKey?: string
    }
    return {
      supabaseUrl: parsed.url,
      supabaseAnonKey: parsed.anonKey,
    }
  } catch {
    return {}
  }
}

/** Resolve before any module imports `supabaseClient` (bootstrap sets `window` first). */
export function resolvePublicSupabaseConfig(): PublicSupabaseConfig | null {
  const fromWindow = globalThis.window?.__LIFTLOG_PUBLIC_CONFIG__
  if (fromWindow?.supabaseUrl && fromWindow?.supabaseAnonKey) {
    return fromWindow
  }

  const fromDom = readLiftlogEnvFromDom()
  const supabaseUrl =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    fromDom.supabaseUrl ||
    ''
  const supabaseAnonKey =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    fromDom.supabaseAnonKey ||
    ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return { supabaseUrl, supabaseAnonKey }
}
