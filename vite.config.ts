import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Inline Supabase client env at build time from `.env` (local) and `process.env`
// (Vercel / CI). Ensures the production bundle always gets literals, not empty
// `import.meta.env.*` placeholders.
function supabaseDefine(mode: string, cwd: string) {
  const env = loadEnv(mode, cwd, 'VITE_')
  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    return {}
  }
  return {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(url),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(key),
  } as Record<string, string>
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    ...supabaseDefine(mode, process.cwd()),
  },
}))
