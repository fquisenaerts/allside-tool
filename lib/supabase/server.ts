import { createClient } from "@supabase/supabase-js"
import type { cookies } from "next/headers"

export function createSupabaseServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
}
