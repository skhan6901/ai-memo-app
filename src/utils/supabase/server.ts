import { createClient } from '@supabase/supabase-js'

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 설정되지 않았습니다.'
    )
  }

  return createClient(url, key)
}
