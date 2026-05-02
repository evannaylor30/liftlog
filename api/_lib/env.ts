type ServerEnv = {
  supabaseUrl: string
  supabaseAnonKey: string
}

export function getServerEnv(): ServerEnv {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase server env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY.',
    )
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}
