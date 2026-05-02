import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel injects env at build time; explicit `define` avoids rare cases where
// `import.meta.env.VITE_*` is not replaced in the client bundle.
function vercelSupabaseDefine(): Record<string, string> | undefined {
  if (process.env.VERCEL !== '1') {
    return undefined
  }
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    return undefined
  }
  return {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(url),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(key),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    ...vercelSupabaseDefine(),
  },
})
