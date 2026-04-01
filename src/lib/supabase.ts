import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co'
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder'

if (
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://xxxx.supabase.co'
) {
  console.warn('[CineRec] VITE_SUPABASE_URL not set — fill in .env.local and restart dev server')
}

export const supabase = createClient(url, key)
