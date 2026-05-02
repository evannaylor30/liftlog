import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/** Values for the browser; supports `VITE_*` or plain `SUPABASE_*` (Vercel naming). */
function liftlogEnvJson(mode: string, cwd: string) {
  const env = loadEnv(mode, cwd, ['VITE_', 'SUPABASE_'])
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
  const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''
  const payload = JSON.stringify({ url, anonKey })
  return payload.replace(/</g, '\\u003c')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'liftlog-inject-public-env',
      transformIndexHtml(html) {
        return html.replace('__LIFTLOG_ENV_JSON__', liftlogEnvJson(mode, process.cwd()))
      },
    },
  ],
}))
